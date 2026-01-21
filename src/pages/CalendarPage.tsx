import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import WorkspaceSidebar from '@/components/WorkspaceSidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Filter,
  Eye,
  Target,
  AlertCircle,
  BookOpen,
  Users,
  Briefcase
} from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, startOfDay, endOfDay, addDays, subDays, startOfMonth, endOfMonth, isSameDay, isToday, isSameMonth, addWeeks, subWeeks, addMonths, subMonths, getHours, getMinutes, setHours, setMinutes } from 'date-fns';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { cn } from '@/lib/utils';
import EmojiIcon from '@/components/EmojiIcon';
import { useToast } from '@/hooks/use-toast';

type CalendarView = 'day' | 'week' | 'month' | 'agenda';
type EventType = 'reminder' | 'timeblock' | 'meeting' | 'deadline' | 'task';

interface CalendarEvent {
  _id: Id<"calendarEvents">;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  workspaceId: Id<"workspaces">;
  documentId?: Id<"documents">;
  type: EventType;
  color?: string;
  priority?: 'low' | 'medium' | 'high';
  isAllDay?: boolean;
  createdAt?: number;
  updatedAt?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const EVENT_TYPE_COLORS: Record<EventType, string> = {
  reminder: '#8b5cf6',
  timeblock: '#06b6d4',
  meeting: '#f59e0b',
  deadline: '#ef4444',
  task: '#10b981',
};

const EVENT_TYPE_ICONS: Record<EventType, React.ReactNode> = {
  reminder: <AlertCircle className="h-3 w-3" />,
  timeblock: <Clock className="h-3 w-3" />,
  meeting: <Users className="h-3 w-3" />,
  deadline: <Target className="h-3 w-3" />,
  task: <Briefcase className="h-3 w-3" />,
};

export default function CalendarPage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const { workspaces, documents, getDocumentsByWorkspace, setCurrentWorkspace } = useWorkspace();
  const { toast } = useToast();
  
  // Debug logging
  useEffect(() => {
    console.log('CalendarPage mounted/updated', {
      workspaceId,
      showCreateDialog,
      eventStartDate,
      eventEndDate,
    });
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('week');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingEventId, setEditingEventId] = useState<Id<"calendarEvents"> | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<Date | null>(null);
  
  // Filters
  const [showReminders, setShowReminders] = useState(true);
  const [showTimeBlocks, setShowTimeBlocks] = useState(true);
  const [showMeetings, setShowMeetings] = useState(true);
  const [showDeadlines, setShowDeadlines] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [focusMode, setFocusMode] = useState(false); // Only show today
  
  // Form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('task');
  const [eventStartDate, setEventStartDate] = useState<Date | null>(null);
  const [eventEndDate, setEventEndDate] = useState<Date | null>(null);
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventEndTime, setEventEndTime] = useState('10:00');
  const [eventIsAllDay, setEventIsAllDay] = useState(false);
  const [eventPriority, setEventPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [eventDocumentId, setEventDocumentId] = useState<string>('');
  const [dragOverTimeSlot, setDragOverTimeSlot] = useState<{ date: Date; hour: number } | null>(null);
  
  const isLoading = workspaces.length === 0;
  
  // Set current workspace and handle navigation
  useEffect(() => {
    if (isLoading) return;
    
    if (!workspaceId) {
      navigate('/');
      return;
    }
    
    if (workspaces === undefined) return;
    
    const workspace = workspaces.find(w => w._id === workspaceId);
    
    if (!workspace) {
      navigate('/');
      return;
    }
    
    setCurrentWorkspace(workspace);
  }, [workspaceId, workspaces, setCurrentWorkspace, navigate, isLoading]);
  
  const workspace = workspaces.find(w => w._id === workspaceId);
  const workspaceDocs = workspaceId ? getDocumentsByWorkspace(workspaceId) : [];
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading calendar...</div>
        </div>
      </div>
    );
  }
  
  // Redirect if workspace not found
  if (!workspace || !workspaceId) {
    return null;
  }
  
  // Calculate date range based on view
  const dateRange = useMemo(() => {
    const now = currentDate;
    if (view === 'day') {
      return { start: startOfDay(now), end: endOfDay(now) };
    } else if (view === 'week') {
      return { start: startOfWeek(now, { weekStartsOn: 0 }), end: endOfWeek(now, { weekStartsOn: 0 }) };
    } else if (view === 'month') {
      return { start: startOfMonth(now), end: endOfMonth(now) };
    } else {
      // Agenda: show current month
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  }, [currentDate, view]);
  
  // Fetch events
  const events = useQuery(
    api.calendar.getCalendarEvents,
    workspaceId && workspace
      ? {
          workspaceId: workspaceId as Id<"workspaces">,
          startDate: dateRange.start.getTime(),
          endDate: dateRange.end.getTime(),
        }
      : 'skip'
  ) ?? [];
  
  // Fetch document due dates
  const documentDueDates = useMemo(() => {
    return workspaceDocs
      .filter((doc: any) => doc.dueDate)
      .map((doc: any) => ({
        ...doc,
        dueDateTimestamp: doc.dueDate,
      }));
  }, [workspaceDocs]);
  
  // Filter events based on filters
  const filteredEvents = useMemo(() => {
    let filtered = [...events];
    
    // Apply type filters
    if (!showReminders) filtered = filtered.filter(e => e.type !== 'reminder');
    if (!showTimeBlocks) filtered = filtered.filter(e => e.type !== 'timeblock');
    if (!showMeetings) filtered = filtered.filter(e => e.type !== 'meeting');
    if (!showDeadlines) filtered = filtered.filter(e => e.type !== 'deadline');
    if (!showTasks) filtered = filtered.filter(e => e.type !== 'task');
    
    // Focus mode: only show today
    if (focusMode && view !== 'day') {
      const today = startOfDay(new Date());
      filtered = filtered.filter(e => 
        isSameDay(new Date(e.startTime), today) ||
        (e.isAllDay && isSameDay(new Date(e.startTime), today))
      );
    }
    
    return filtered;
  }, [events, showReminders, showTimeBlocks, showMeetings, showDeadlines, showTasks, focusMode, view]);
  
  const createEvent = useMutation(api.calendar.createCalendarEvent);
  const updateEvent = useMutation(api.calendar.updateCalendarEvent);
  const deleteEvent = useMutation(api.calendar.deleteCalendarEvent);

  // Handle document drop on calendar time slot
  const handleTimeSlotDrop = async (date: Date, hour: number, documentId: string) => {
    if (!workspaceId || !workspace) return;
    
    const slotDate = setMinutes(setHours(date, hour), 0);
    const endSlot = setMinutes(setHours(slotDate, hour + 1), 0);
    
    const doc = workspaceDocs.find(d => d._id === documentId);
    if (!doc) return;
    
    try {
      await createEvent({
        title: doc.title || 'Untitled',
        description: `Time block for: ${doc.title || 'Untitled'}`,
        startTime: slotDate.getTime(),
        endTime: endSlot.getTime(),
        workspaceId: workspaceId as Id<"workspaces">,
        documentId: documentId as Id<"documents">,
        type: 'timeblock',
        color: EVENT_TYPE_COLORS.timeblock,
        priority: 'medium',
        isAllDay: false,
      });
      
      toast({
        title: 'Event created',
        description: `"${doc.title || 'Untitled'}" added to calendar`,
      });
    } catch (error) {
      console.error('Error creating event from drop:', error);
      toast({
        title: 'Error',
        description: 'Failed to create calendar event',
        variant: 'destructive',
      });
    }
  };
  
  // Combine events with document due dates
  const allCalendarItems = useMemo(() => {
    const items: Array<CalendarEvent | any> = [...filteredEvents];
    
    // Add document due dates as deadline events
    documentDueDates.forEach((doc: any) => {
      if (doc.dueDateTimestamp) {
        const dueDate = new Date(doc.dueDateTimestamp);
        const startOfDueDate = startOfDay(dueDate);
        const endOfDueDate = endOfDay(dueDate);
        
        // Check if due date is in range
        if (dueDate >= dateRange.start && dueDate <= dateRange.end) {
          items.push({
            _id: `doc-${doc._id}`,
            title: doc.title || 'Untitled',
            description: `Due date for: ${doc.title}`,
            startTime: startOfDueDate.getTime(),
            endTime: endOfDueDate.getTime(),
            workspaceId: doc.workspaceId,
            documentId: doc._id,
            type: 'deadline' as EventType,
            color: EVENT_TYPE_COLORS.deadline,
            priority: 'high' as const,
            isAllDay: true,
            isDocumentDueDate: true,
          });
        }
      }
    });
    
    return items;
  }, [filteredEvents, documentDueDates, dateRange]);
  
  // Get events for a specific day
  const getEventsForDay = useCallback((date: Date) => {
    if (!allCalendarItems || !Array.isArray(allCalendarItems)) return [];
    return allCalendarItems.filter((event) => {
      if (!event || !event.startTime || !event.endTime) return false;
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return (
        isSameDay(eventStart, date) ||
        isSameDay(eventEnd, date) ||
        (eventStart <= startOfDay(date) && eventEnd >= endOfDay(date))
      );
    });
  }, [allCalendarItems]);
  
  // Get events for a specific hour
  const getEventsForHour = useCallback((date: Date, hour: number) => {
    if (!allCalendarItems || !Array.isArray(allCalendarItems)) return [];
    const hourStart = setMinutes(setHours(date, hour), 0);
    const hourEnd = setMinutes(setHours(date, hour), 59);
    
    return allCalendarItems.filter((event) => {
      if (!event || !event.startTime || !event.endTime) return false;
      if (event.isAllDay) return false;
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return (
        (eventStart >= hourStart && eventStart <= hourEnd) ||
        (eventEnd >= hourStart && eventEnd <= hourEnd) ||
        (eventStart <= hourStart && eventEnd >= hourEnd)
      );
    });
  }, [allCalendarItems]);
  
  // Group consecutive events with no gaps
  const groupConsecutiveEvents = useCallback((events: CalendarEvent[]) => {
    if (!events || events.length === 0) return [];
    
    // Sort events by start time
    const sortedEvents = [...events].sort((a, b) => a.startTime - b.startTime);
    const groups: Array<{ events: CalendarEvent[]; startTime: number; endTime: number; color: string }> = [];
    
    for (const event of sortedEvents) {
      if (!event || !event.startTime || !event.endTime) continue;
      
      let addedToGroup = false;
      
      // Try to find a group where this event connects
      for (const group of groups) {
        // Check if event starts exactly when group ends (no gap)
        const groupEnd = group.endTime;
        const eventStart = event.startTime;
        
        // Allow small tolerance for floating point issues (1 second = 1000ms)
        // Only group if one ends exactly when the next starts (no gap, no overlap)
        if (Math.abs(groupEnd - eventStart) <= 1000) {
          // Merge into group - use the color of the first event in the group
          group.events.push(event);
          group.endTime = Math.max(group.endTime, event.endTime);
          addedToGroup = true;
          break;
        }
      }
      
      // If not added to existing group, create new group
      if (!addedToGroup) {
        groups.push({
          events: [event],
          startTime: event.startTime,
          endTime: event.endTime,
          color: event.color || EVENT_TYPE_COLORS[event.type],
        });
      }
    }
    
    return groups;
  }, []);
  
  // Navigation
  const goToToday = () => setCurrentDate(new Date());
  const goToPrevious = () => {
    if (view === 'day') setCurrentDate(prev => subDays(prev, 1));
    else if (view === 'week') setCurrentDate(prev => subWeeks(prev, 1));
    else setCurrentDate(prev => subMonths(prev, 1));
  };
  const goToNext = () => {
    if (view === 'day') setCurrentDate(prev => addDays(prev, 1));
    else if (view === 'week') setCurrentDate(prev => addWeeks(prev, 1));
    else setCurrentDate(prev => addMonths(prev, 1));
  };
  
  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour: number) => {
    try {
      const slotDate = setMinutes(setHours(date, hour), 0);
      setSelectedDate(slotDate);
      setSelectedTimeSlot(slotDate);
      setEventStartDate(slotDate);
      setEventEndDate(addDays(slotDate, 0));
      const [hourStr, minuteStr] = format(slotDate, 'HH:mm').split(':');
      setEventStartTime(`${hourStr}:${minuteStr}`);
      const endSlot = setMinutes(setHours(slotDate, hour + 1), 0);
      const [endHourStr, endMinuteStr] = format(endSlot, 'HH:mm').split(':');
      setEventEndTime(`${endHourStr}:${endMinuteStr}`);
      setShowCreateDialog(true);
    } catch (error) {
      console.error('Error in handleTimeSlotClick:', error);
    }
  };
  
  // Handle new event button click
  const handleNewEventClick = () => {
    try {
      console.log('handleNewEventClick called');
      // Set default dates to today if not set
      const today = new Date();
      const defaultStart = setMinutes(setHours(today, 9), 0);
      const defaultEnd = setMinutes(setHours(today, 10), 0);
      
      console.log('Setting default dates', { defaultStart, defaultEnd });
      
      setEventStartDate(defaultStart);
      setEventEndDate(defaultEnd);
      setEventStartTime('09:00');
      setEventEndTime('10:00');
      
      console.log('Opening dialog');
      setShowCreateDialog(true);
      console.log('Dialog state set to true');
    } catch (error) {
      console.error('Error in handleNewEventClick:', error);
    }
  };
  
  // Handle edit button click - populate form with event data
  const handleEditClick = () => {
    if (!selectedEvent) return;
    
    try {
      setEventTitle(selectedEvent.title);
      setEventDescription(selectedEvent.description || '');
      setEventType(selectedEvent.type);
      setEventPriority(selectedEvent.priority || 'medium');
      setEventIsAllDay(selectedEvent.isAllDay || false);
      setEventDocumentId(selectedEvent.documentId || 'none');
      
      const startDate = new Date(selectedEvent.startTime);
      const endDate = new Date(selectedEvent.endTime);
      
      setEventStartDate(startDate);
      setEventEndDate(endDate);
      
      if (!selectedEvent.isAllDay) {
        setEventStartTime(format(startDate, 'HH:mm'));
        setEventEndTime(format(endDate, 'HH:mm'));
      } else {
        setEventStartTime('09:00');
        setEventEndTime('10:00');
      }
      
      setIsEditMode(true);
      setEditingEventId(selectedEvent._id);
      setShowCreateDialog(true);
      setSelectedEvent(null); // Close the details dialog
    } catch (error) {
      console.error('Error setting up edit mode:', error);
    }
  };
  
  // Handle create/update event
  const handleCreateEvent = async () => {
    try {
      if (!workspaceId || !workspace || !eventStartDate || !eventEndDate || !eventTitle.trim()) {
        console.error('Missing required fields:', { workspaceId, workspace, eventStartDate, eventEndDate, eventTitle });
        return;
      }
      
      const startTime = eventIsAllDay
        ? startOfDay(eventStartDate).getTime()
        : (() => {
            const [hours, minutes] = eventStartTime.split(':').map(Number);
            return setMinutes(setHours(eventStartDate, hours), minutes).getTime();
          })();
      
      const endTime = eventIsAllDay
        ? endOfDay(eventEndDate).getTime()
        : (() => {
            const [hours, minutes] = eventEndTime.split(':').map(Number);
            return setMinutes(setHours(eventEndDate, hours), minutes).getTime();
          })();
      
      if (isEditMode && editingEventId && !editingEventId.toString().startsWith('doc-')) {
        // Update existing event
        await updateEvent({
          id: editingEventId,
          title: eventTitle.trim(),
          description: eventDescription || undefined,
          startTime,
          endTime,
          type: eventType,
          color: EVENT_TYPE_COLORS[eventType],
          priority: eventPriority,
          isAllDay: eventIsAllDay,
        });
        
        toast({
          title: 'Event updated',
          description: `"${eventTitle.trim()}" has been updated`,
        });
      } else {
        // Create new event
        await createEvent({
          title: eventTitle.trim(),
          description: eventDescription || undefined,
          startTime,
          endTime,
          workspaceId: workspaceId as Id<"workspaces">,
          documentId: eventDocumentId && eventDocumentId !== "none" ? (eventDocumentId as Id<"documents">) : undefined,
          type: eventType,
          color: EVENT_TYPE_COLORS[eventType],
          priority: eventPriority,
          isAllDay: eventIsAllDay,
        });
        
        toast({
          title: 'Event created',
          description: `"${eventTitle.trim()}" has been added to the calendar`,
        });
      }
      
      // Reset form
      setEventTitle('');
      setEventDescription('');
      setEventStartDate(null);
      setEventEndDate(null);
      setEventStartTime('09:00');
      setEventEndTime('10:00');
      setEventIsAllDay(false);
      setEventPriority('medium');
      setEventDocumentId('none');
      setShowCreateDialog(false);
      setIsEditMode(false);
      setEditingEventId(null);
      setSelectedEvent(null);
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: 'Error',
        description: 'Failed to save event',
        variant: 'destructive',
      });
    }
  };
  
  // Context switching awareness - detect fragmented days
  const getFragmentationScore = useCallback((date: Date) => {
    const dayEvents = getEventsForDay(date)
      .filter(e => !e.isAllDay)
      .sort((a, b) => a.startTime - b.startTime);
    
    if (dayEvents.length === 0) return { score: 0, gaps: 0 };
    
    let gaps = 0;
    let totalGapMinutes = 0;
    
    for (let i = 0; i < dayEvents.length - 1; i++) {
      const currentEnd = new Date(dayEvents[i].endTime);
      const nextStart = new Date(dayEvents[i + 1].startTime);
      const gapMinutes = (nextStart.getTime() - currentEnd.getTime()) / (1000 * 60);
      
      if (gapMinutes > 15) { // Gap of more than 15 minutes
        gaps++;
        totalGapMinutes += gapMinutes;
      }
    }
    
    // Score: 0-100, higher = more fragmented
    const score = Math.min(100, (gaps * 10) + (totalGapMinutes / 60));
    return { score, gaps, totalGapMinutes };
  }, [getEventsForDay]);
  
  // Render Day View
  const renderDayView = () => {
    const dayStart = startOfDay(currentDate);
    const dayEvents = getEventsForDay(currentDate);
    const { score, gaps } = getFragmentationScore(currentDate);
    
    return (
      <div className="flex flex-col h-full">
        {/* Fragmentation indicator */}
        {gaps > 0 && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <span className="text-sm font-medium text-amber-900 dark:text-amber-100">
                  Fragmented Day
                </span>
              </div>
              <Badge variant="outline" className="text-amber-700 dark:text-amber-300">
                {gaps} gap{gaps !== 1 ? 's' : ''} • {Math.round(score)}% fragmented
              </Badge>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Your schedule has {gaps} gap{gaps !== 1 ? 's' : ''} between events, which may reduce focus time.
            </p>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <div className="flex">
            {/* Time column */}
            <div className="w-20 border-r shrink-0">
              <div className="h-16 border-b"></div>
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(setHours(dayStart, hour), 'ha').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Events column */}
            <div className="flex-1 relative">
              {/* Hour slot clickable areas */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className={cn(
                    "absolute left-0 right-0 border-b cursor-pointer transition-colors",
                    dragOverTimeSlot?.date.getTime() === dayStart.getTime() && dragOverTimeSlot?.hour === hour
                      ? "bg-primary/30 border-2 border-primary border-dashed"
                      : "hover:bg-accent/50"
                  )}
                  style={{
                    top: `${hour * 64}px`,
                    height: '64px',
                  }}
                  onClick={() => handleTimeSlotClick(dayStart, hour)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.dataTransfer.dropEffect = 'move';
                    setDragOverTimeSlot({ date: dayStart, hour });
                  }}
                  onDragLeave={(e) => {
                    e.stopPropagation();
                    setDragOverTimeSlot(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setDragOverTimeSlot(null);
                    
                    const documentId = e.dataTransfer.getData('text/plain') || (window as any).__draggedDocumentId;
                    if (documentId) {
                      handleTimeSlotDrop(dayStart, hour, documentId);
                    }
                    (window as any).__draggedDocumentId = null;
                  }}
                />
              ))}
              
              {/* Render all events grouped across the entire day */}
              {(() => {
                const dayNonAllDayEvents = dayEvents.filter(e => !e.isAllDay);
                const eventGroups = groupConsecutiveEvents(dayNonAllDayEvents);
                
                return eventGroups.map((group, groupIdx) => {
                  const eventStart = new Date(group.startTime);
                  const eventEnd = new Date(group.endTime);
                  const dayStartMs = dayStart.getTime();
                  const startMs = eventStart.getTime();
                  const endMs = eventEnd.getTime();
                  
                  // Calculate position from start of day (each hour is 64px)
                  const dayStartMinutes = getHours(dayStart) * 60 + getMinutes(dayStart);
                  const eventStartMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                  const eventEndMinutes = getHours(eventEnd) * 60 + getMinutes(eventEnd);
                  
                  // Top position in pixels (each hour = 64px = 3840px/60 minutes)
                  const topPx = ((eventStartMinutes - dayStartMinutes) / 60) * 64;
                  
                  // Height in pixels - if event ends exactly at hour boundary, don't include that hour
                  const durationMinutes = eventEndMinutes - eventStartMinutes;
                  const heightPx = (durationMinutes / 60) * 64;
                  
                  // For merged groups, show multiple titles if space permits
                  const titles = group.events.map(e => e.title).join(' • ');
                  const startTime = format(eventStart, 'h:mm a');
                  const endTime = format(eventEnd, 'h:mm a');
                  
                  return (
                    <div
                      key={`group-${groupIdx}-${group.startTime}`}
                      className="absolute left-0 right-0 m-1 rounded p-1.5 text-xs overflow-hidden cursor-pointer"
                      style={{
                        top: `${topPx}px`,
                        height: `${heightPx}px`,
                        backgroundColor: group.color,
                        color: 'white',
                        zIndex: 10 + groupIdx,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show first event on click
                        setSelectedEvent(group.events[0]);
                      }}
                    >
                      <div className="font-medium truncate">{titles}</div>
                      {heightPx > 32 && (
                        <div className="text-xs opacity-90">
                          {startTime} - {endTime}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        
        {/* All-day events */}
        {dayEvents.filter(e => e.isAllDay).length > 0 && (
          <div className="mt-4 space-y-1">
            <div className="text-xs font-medium text-muted-foreground mb-2">All Day</div>
            {dayEvents.filter(e => e.isAllDay).map((event) => (
              <div
                key={event._id}
                className="p-2 rounded border cursor-pointer hover:bg-accent"
                style={{
                  borderLeftColor: event.color || EVENT_TYPE_COLORS[event.type],
                  borderLeftWidth: '4px',
                }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-center gap-2">
                  <span style={{ color: event.color || EVENT_TYPE_COLORS[event.type] }}>
                    {EVENT_TYPE_ICONS[event.type]}
                  </span>
                  <span className="font-medium">{event.title}</span>
                  {event.priority === 'high' && (
                    <Badge variant="destructive" className="ml-auto text-xs">High</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Render Week View
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart, { weekStartsOn: 0 }) });
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto border rounded-lg">
          <div className="flex">
            {/* Time column */}
            <div className="w-20 border-r shrink-0">
              <div className="h-16 border-b"></div>
              {HOURS.map((hour) => (
                <div key={hour} className="h-16 border-b flex items-start justify-end pr-2 pt-1">
                  <span className="text-xs text-muted-foreground">
                    {format(setHours(weekStart, hour), 'ha').toLowerCase()}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Days columns */}
            {weekDays.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day);
              const { score, gaps } = getFragmentationScore(day);
              
              return (
                <div key={dayIdx} className="flex-1 border-r last:border-r-0 relative">
                  {/* Day header */}
                  <div className="h-16 border-b flex flex-col items-center justify-center p-2">
                    <div className={cn(
                      "text-xs font-medium",
                      isToday(day) && "text-primary font-bold",
                      !isSameMonth(day, currentDate) && "text-muted-foreground"
                    )}>
                      {format(day, 'EEE')}
                    </div>
                    <div className={cn(
                      "text-lg font-semibold",
                      isToday(day) && "text-primary",
                      !isSameMonth(day, currentDate) && "text-muted-foreground"
                    )}>
                      {format(day, 'd')}
                    </div>
                  </div>
                  
                  {/* Fragmentation indicator */}
                  {gaps > 0 && (
                    <div className="absolute top-16 left-0 right-0 h-1 bg-amber-500/30 z-20" />
                  )}
                  
                  {/* Hour slot clickable areas */}
                  {HOURS.map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        "absolute left-0 right-0 border-b cursor-pointer transition-colors",
                        dragOverTimeSlot?.date.getTime() === day.getTime() && dragOverTimeSlot?.hour === hour
                          ? "bg-primary/30 border-2 border-primary border-dashed"
                          : "hover:bg-accent/50"
                      )}
                      style={{
                        top: `${64 + hour * 64}px`,
                        height: '64px',
                      }}
                      onClick={() => handleTimeSlotClick(day, hour)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        e.dataTransfer.dropEffect = 'move';
                        setDragOverTimeSlot({ date: day, hour });
                      }}
                      onDragLeave={(e) => {
                        e.stopPropagation();
                        setDragOverTimeSlot(null);
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDragOverTimeSlot(null);
                        
                        const documentId = e.dataTransfer.getData('text/plain') || (window as any).__draggedDocumentId;
                        if (documentId) {
                          handleTimeSlotDrop(day, hour, documentId);
                        }
                        (window as any).__draggedDocumentId = null;
                      }}
                    />
                  ))}
                  
                  {/* Render all events grouped across the entire day */}
                  {(() => {
                    const dayNonAllDayEvents = dayEvents.filter(e => !e.isAllDay);
                    const eventGroups = groupConsecutiveEvents(dayNonAllDayEvents);
                    
                    return eventGroups.map((group, groupIdx) => {
                      const eventStart = new Date(group.startTime);
                      const eventEnd = new Date(group.endTime);
                      const dayStartDate = startOfDay(day);
                      
                      const dayStartMinutes = getHours(dayStartDate) * 60 + getMinutes(dayStartDate);
                      const eventStartMinutes = getHours(eventStart) * 60 + getMinutes(eventStart);
                      const eventEndMinutes = getHours(eventEnd) * 60 + getMinutes(eventEnd);
                      
                      // Top position in pixels (64px for header + hour * 64px)
                      const topPx = 64 + ((eventStartMinutes - dayStartMinutes) / 60) * 64;
                      
                      // Height in pixels - if event ends exactly at hour boundary, don't include that hour
                      const durationMinutes = eventEndMinutes - eventStartMinutes;
                      const heightPx = (durationMinutes / 60) * 64;
                      
                      // For merged groups, show multiple titles if space permits
                      const titles = group.events.map(e => e.title).join(' • ');
                      
                      return (
                        <div
                          key={`group-${groupIdx}-${group.startTime}`}
                          className="absolute left-0 right-0 m-0.5 rounded p-1 text-xs overflow-hidden cursor-pointer"
                          style={{
                            top: `${topPx}px`,
                            height: `${heightPx}px`,
                            backgroundColor: group.color,
                            color: 'white',
                            zIndex: 10 + groupIdx,
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            // Show first event on click
                            setSelectedEvent(group.events[0]);
                          }}
                        >
                          <div className="font-medium truncate">{titles}</div>
                          {heightPx > 32 && (
                            <div className="text-xs opacity-90">
                              {format(eventStart, 'h:mm a')}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                  
                  {/* All-day events */}
                  {dayEvents.filter(e => e.isAllDay).length > 0 && (
                    <div className="absolute top-16 left-0 right-0 border-b bg-muted/30">
                      {dayEvents.filter(e => e.isAllDay).map((event, idx) => (
                        <div
                          key={event._id}
                          className="px-1 py-0.5 text-xs truncate cursor-pointer hover:opacity-80"
                          style={{
                            backgroundColor: event.color || EVENT_TYPE_COLORS[event.type],
                            color: 'white',
                            marginTop: `${idx * 20}px`,
                            height: '18px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEvent(event);
                          }}
                        >
                          {event.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  // Render Month View
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    const weeks: Date[][] = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
    }
    
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-px border rounded-lg bg-border">
          {/* Day headers */}
          {DAYS.map((day) => (
            <div key={day} className="bg-background p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {weeks.map((week, weekIdx) =>
            week.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day);
              const { gaps } = getFragmentationScore(day);
              
              return (
                <div
                  key={`${weekIdx}-${dayIdx}`}
                  className={cn(
                    "bg-background min-h-[120px] p-2 border-b border-r",
                    !isSameMonth(day, currentDate) && "opacity-40"
                  )}
                >
                  <div className={cn(
                    "text-sm font-medium mb-1",
                    isToday(day) && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center",
                    !isToday(day) && "text-muted-foreground"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  {/* Fragmentation indicator */}
                  {gaps > 0 && (
                    <div className="h-1 bg-amber-500/50 rounded-full mb-1" />
                  )}
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event._id}
                        className="text-xs p-1 rounded truncate cursor-pointer hover:opacity-80"
                        style={{
                          backgroundColor: event.color || EVENT_TYPE_COLORS[event.type],
                          color: 'white',
                        }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        {format(new Date(event.startTime), 'h:mm a')} {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };
  
  // Render Agenda View
  const renderAgendaView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const eventsByDay = calendarDays.map(day => ({
      date: day,
      events: getEventsForDay(day).sort((a, b) => a.startTime - b.startTime),
    })).filter(day => day.events.length > 0);
    
    return (
      <div className="flex-1 overflow-y-auto space-y-6">
        {eventsByDay.length === 0 ? (
          <div className="text-center text-muted-foreground py-12">
            No events scheduled for this month
          </div>
        ) : (
          eventsByDay.map(({ date, events }) => {
            const { score, gaps } = getFragmentationScore(date);
            
            return (
              <Card key={date.getTime()}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {format(date, 'EEEE, MMMM d')}
                      {isToday(date) && (
                        <Badge variant="secondary" className="ml-2">Today</Badge>
                      )}
                    </CardTitle>
                    {gaps > 0 && (
                      <Badge variant="outline" className="text-amber-700 dark:text-amber-300">
                        {gaps} gap{gaps !== 1 ? 's' : ''} • {Math.round(score)}% fragmented
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {events.map((event) => (
                      <div
                        key={event._id}
                        className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-accent transition-colors"
                        style={{
                          borderLeftColor: event.color || EVENT_TYPE_COLORS[event.type],
                          borderLeftWidth: '4px',
                        }}
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span style={{ color: event.color || EVENT_TYPE_COLORS[event.type] }}>
                              {EVENT_TYPE_ICONS[event.type]}
                            </span>
                            <span className="font-medium">{event.title}</span>
                            {event.priority === 'high' && (
                              <Badge variant="destructive" className="ml-auto">High</Badge>
                            )}
                          </div>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-1">{event.description}</p>
                          )}
                          <div className="text-xs text-muted-foreground">
                            {event.isAllDay ? (
                              'All day'
                            ) : (
                              <>
                                {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                              </>
                            )}
                          </div>
                          {event.documentId && (
                            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                              <BookOpen className="h-3 w-3" />
                              Linked to document
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    );
  };
  
  if (!workspaceId || !workspace) {
    return null;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <WorkspaceSidebar />
        <SidebarInset className="flex-1 w-full min-w-0 flex flex-col">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  <CalendarIcon className="h-6 w-6" />
                  Calendar
                </h1>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={goToPrevious}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-lg font-semibold">
                  {view === 'day' && format(currentDate, 'EEEE, MMMM d, yyyy')}
                  {view === 'week' && `${format(startOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d')} - ${format(endOfWeek(currentDate, { weekStartsOn: 0 }), 'MMM d, yyyy')}`}
                  {view === 'month' && format(currentDate, 'MMMM yyyy')}
                  {view === 'agenda' && format(currentDate, 'MMMM yyyy')}
                </div>
              </div>
              <Button onClick={handleNewEventClick}>
                <Plus className="h-4 w-4 mr-2" />
                New Event
              </Button>
            </div>
            
            {/* View tabs */}
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Filters */}
          <div className="border-b p-3 bg-muted/30">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="reminders"
                    checked={showReminders}
                    onCheckedChange={(checked) => setShowReminders(checked as boolean)}
                  />
                  <Label htmlFor="reminders" className="text-sm cursor-pointer">Reminders</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="timeblocks"
                    checked={showTimeBlocks}
                    onCheckedChange={(checked) => setShowTimeBlocks(checked as boolean)}
                  />
                  <Label htmlFor="timeblocks" className="text-sm cursor-pointer">Time Blocks</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="meetings"
                    checked={showMeetings}
                    onCheckedChange={(checked) => setShowMeetings(checked as boolean)}
                  />
                  <Label htmlFor="meetings" className="text-sm cursor-pointer">Meetings</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="deadlines"
                    checked={showDeadlines}
                    onCheckedChange={(checked) => setShowDeadlines(checked as boolean)}
                  />
                  <Label htmlFor="deadlines" className="text-sm cursor-pointer">Deadlines</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="tasks"
                    checked={showTasks}
                    onCheckedChange={(checked) => setShowTasks(checked as boolean)}
                  />
                  <Label htmlFor="tasks" className="text-sm cursor-pointer">Tasks</Label>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Eye className={cn("h-4 w-4", focusMode && "text-primary")} />
                <Label htmlFor="focus" className="text-sm cursor-pointer">Focus Mode (Today Only)</Label>
                <Switch
                  id="focus"
                  checked={focusMode}
                  onCheckedChange={setFocusMode}
                />
              </div>
            </div>
          </div>
          
          {/* Calendar view content */}
          <div className="flex-1 overflow-hidden p-4">
            {view === 'day' && renderDayView()}
            {view === 'week' && renderWeekView()}
            {view === 'month' && renderMonthView()}
            {view === 'agenda' && renderAgendaView()}
          </div>
          
          {/* Create/Edit Event Dialog */}
          {showCreateDialog && (
            <Dialog open={showCreateDialog} onOpenChange={(open) => {
              console.log('Dialog onOpenChange', open);
              setShowCreateDialog(open);
              if (!open) {
                // Reset form when closing
                setEventTitle('');
                setEventDescription('');
                setEventStartDate(null);
                setEventEndDate(null);
                setEventStartTime('09:00');
                setEventEndTime('10:00');
                setEventIsAllDay(false);
                setEventPriority('medium');
                setEventDocumentId('none');
                setIsEditMode(false);
                setEditingEventId(null);
                setSelectedEvent(null);
              }
            }}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Edit Event' : 'Create New Event'}</DialogTitle>
                  <DialogDescription>
                    {isEditMode ? 'Update the event details' : 'Add a new calendar event, reminder, or time block'}
                  </DialogDescription>
                </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    placeholder="Event title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={eventDescription}
                    onChange={(e) => setEventDescription(e.target.value)}
                    placeholder="Add details..."
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={eventType} onValueChange={(v) => setEventType(v as EventType)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="task">Task</SelectItem>
                        <SelectItem value="timeblock">Time Block</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                        <SelectItem value="deadline">Deadline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={eventPriority} onValueChange={(v) => setEventPriority(v as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="document">Link to Document (Optional)</Label>
                  <Select 
                    value={eventDocumentId || "none"} 
                    onValueChange={(value) => setEventDocumentId(value === "none" ? "" : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {workspaceDocs && Array.isArray(workspaceDocs) && workspaceDocs.map((doc) => (
                        <SelectItem key={doc._id} value={doc._id}>
                          <div className="flex items-center gap-2">
                            <EmojiIcon emoji={doc.icon || '📄'} size={16} />
                            {doc.title || 'Untitled'}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Switch
                    id="allDay"
                    checked={eventIsAllDay}
                    onCheckedChange={setEventIsAllDay}
                  />
                  <Label htmlFor="allDay" className="cursor-pointer">All Day Event</Label>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventStartDate && eventStartDate instanceof Date && !isNaN(eventStartDate.getTime()) 
                            ? format(eventStartDate, 'PPP') 
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventStartDate && eventStartDate instanceof Date && !isNaN(eventStartDate.getTime()) ? eventStartDate : undefined}
                          onSelect={(date) => {
                            if (date && date instanceof Date && !isNaN(date.getTime())) {
                              setEventStartDate(date);
                              if (!eventEndDate) setEventEndDate(date);
                            } else {
                              setEventStartDate(null);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {!eventIsAllDay && (
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={eventStartTime}
                        onChange={(e) => setEventStartTime(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {eventEndDate && eventEndDate instanceof Date && !isNaN(eventEndDate.getTime()) 
                            ? format(eventEndDate, 'PPP') 
                            : 'Pick a date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={eventEndDate && eventEndDate instanceof Date && !isNaN(eventEndDate.getTime()) ? eventEndDate : undefined}
                          onSelect={(date) => {
                            if (date && date instanceof Date && !isNaN(date.getTime())) {
                              setEventEndDate(date);
                            } else {
                              setEventEndDate(null);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {!eventIsAllDay && (
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={eventEndTime}
                        onChange={(e) => setEventEndTime(e.target.value)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  setIsEditMode(false);
                  setEditingEventId(null);
                  setSelectedEvent(null);
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateEvent} disabled={!eventTitle.trim() || !eventStartDate || !eventEndDate}>
                  {isEditMode ? 'Save Changes' : 'Create Event'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          )}
          
          {/* Event Details Dialog */}
          {selectedEvent && (
            <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span style={{ color: selectedEvent.color || EVENT_TYPE_COLORS[selectedEvent.type] }}>
                      {EVENT_TYPE_ICONS[selectedEvent.type]}
                    </span>
                    {selectedEvent.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {selectedEvent.description && (
                    <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
                  )}
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Type: </span>
                      <Badge>{selectedEvent.type}</Badge>
                    </div>
                    {selectedEvent.priority && (
                      <div>
                        <span className="font-medium">Priority: </span>
                        <Badge variant={selectedEvent.priority === 'high' ? 'destructive' : 'outline'}>
                          {selectedEvent.priority}
                        </Badge>
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Time: </span>
                      {selectedEvent.isAllDay ? (
                        'All day'
                      ) : (
                        <>
                          {format(new Date(selectedEvent.startTime), 'PPP h:mm a')} - {format(new Date(selectedEvent.endTime), 'h:mm a')}
                        </>
                      )}
                    </div>
                    {selectedEvent.documentId && (
                      <div>
                        <span className="font-medium">Linked Document: </span>
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => {
                            navigate(`/workspace/${workspaceId}/document/${selectedEvent.documentId}`);
                            setSelectedEvent(null);
                          }}
                        >
                          {workspaceDocs.find(d => d._id === selectedEvent.documentId)?.title || 'View document'}
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-3 pt-4">
                    {!selectedEvent._id.toString().startsWith('doc-') && (
                      <>
                        <Button
                          variant="outline"
                          onClick={handleEditClick}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={async () => {
                            if (selectedEvent._id && !selectedEvent._id.toString().startsWith('doc-')) {
                              await deleteEvent({ id: selectedEvent._id });
                              toast({
                                title: 'Event deleted',
                                description: `"${selectedEvent.title}" has been removed from the calendar`,
                              });
                            }
                            setSelectedEvent(null);
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    )}
                    <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                      Close
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
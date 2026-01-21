import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

const getTimeData = () => {
  const now = new Date();

  const time = now.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const date = now.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return { time, date };
};

export default function CurrentTime() {
  const [data, setData] = useState(getTimeData());

  useEffect(() => {
    const interval = setInterval(() => {
      setData(getTimeData());
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
        className="
            flex items-center gap-4
            rounded-xl
            border border-border
            bg-background/80
            px-4 py-2
            backdrop-blur-sm
            min-w-[150px]
        "
    >
        <Clock className="h-4 w-4 text-muted-foreground" />

        <div className="flex flex-col leading-tight">
            <span className="text-base font-semibold tabular-nums text-foreground">
                {data.time}
            </span>
            <span className="text-xs text-muted-foreground">
                {data.date}
            </span>
        </div>
    </div>
  );
}

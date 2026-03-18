import * as React from 'react';
import { MailIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface EmailInputProps extends Omit<
  React.ComponentProps<typeof Input>,
  'type'
> {
  type?: 'email';
}

const EmailInput = React.forwardRef<HTMLInputElement, EmailInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <div className="relative">
        <MailIcon
          data-slot="input-icon"
          className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          ref={ref}
          type="email"
          className={cn('pl-9', className)}
          {...props}
        />
      </div>
    );
  },
);

EmailInput.displayName = 'EmailInput';

export { EmailInput };

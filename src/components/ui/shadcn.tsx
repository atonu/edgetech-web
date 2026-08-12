import * as React from 'react';
import styles from './shadcn.module.css';

type Variant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        styles.button,
        variant === 'default' && styles.buttonDefault,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'outline' && styles.buttonOutline,
        variant === 'ghost' && styles.buttonGhost,
        variant === 'destructive' && styles.buttonDestructive,
        size === 'sm' && styles.buttonSm,
        size === 'md' && styles.buttonMd,
        size === 'lg' && styles.buttonLg,
        className
      )}
      {...props}
    />
  );
}

export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.card, className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.cardHeader, className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn(styles.cardTitle, className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn(styles.cardDescription, className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.cardContent, className)} {...props} />;
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn(styles.label, className)} {...props} />;
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(styles.input, className)} {...props} />
);
Input.displayName = 'Input';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(styles.textarea, className)} {...props} />
);
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => <select ref={ref} className={cn(styles.select, className)} {...props} />
);
Select.displayName = 'Select';

export function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant | 'success' | 'warning' }) {
  return (
    <span
      className={cn(
        styles.badge,
        variant === 'default' && styles.badgeDefault,
        variant === 'secondary' && styles.badgeSecondary,
        variant === 'success' && styles.badgeSuccess,
        variant === 'warning' && styles.badgeWarning,
        variant === 'destructive' && styles.badgeDestructive,
        className
      )}
      {...props}
    />
  );
}

export function Tabs({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.tabs, className)} {...props} />;
}

export function TabsList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.tabsList, className)} {...props} />;
}

export function TabsTrigger({
  className,
  active,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(styles.tabsTrigger, active && styles.tabsTriggerActive, className)}
      {...props}
    />
  );
}

export function TableWrap({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(styles.tableWrap, className)} {...props} />;
}

export function Table({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn(styles.table, className)} {...props} />;
}

export function TH({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return <th className={cn(styles.th, className)} {...props} />;
}

export function TD({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn(styles.td, className)} {...props} />;
}

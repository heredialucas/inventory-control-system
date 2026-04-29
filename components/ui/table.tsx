import * as React from "react"

import { cn } from "@/lib/utils"

const Table = React.forwardRef<
    HTMLTableElement,
    React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
        <table
            ref={ref}
            className={cn(
                "w-full caption-bottom text-sm",
                // Sticky actions column
                "[&_th:last-child]:sticky [&_th:last-child]:right-0 [&_th:last-child]:bg-background [&_th:last-child]:z-10",
                "[&_td:last-child]:sticky [&_td:last-child]:right-0 [&_td:last-child]:bg-background [&_td:last-child]:z-10",
                // Guaranteed vertical line using pseudo-element with higher z-index
                "[&_th:last-child]:before:content-[''] [&_th:last-child]:before:absolute [&_th:last-child]:before:left-0 [&_th:last-child]:before:inset-y-0 [&_th:last-child]:before:w-px [&_th:last-child]:before:bg-border [&_th:last-child]:before:z-20",
                "[&_td:last-child]:before:content-[''] [&_td:last-child]:before:absolute [&_td:last-child]:before:left-0 [&_td:last-child]:before:inset-y-0 [&_td:last-child]:before:w-px [&_td:last-child]:before:bg-border [&_td:last-child]:before:z-20",
                // Subtle shadow to enhance depth when scrolling over content
                "[&_th:last-child]:shadow-[-10px_0_15px_-15px_rgba(0,0,0,0.3)]",
                "[&_td:last-child]:shadow-[-10px_0_15px_-15px_rgba(0,0,0,0.3)]",
                // Stacking actions on mobile - targets a div container inside the last cell
                "[&_td:last-child>div]:flex [&_td:last-child>div]:flex-col [&_td:last-child>div]:sm:flex-row",
                "[&_td:last-child>div]:items-center [&_td:last-child>div]:justify-center [&_td:last-child>div]:sm:justify-end [&_td:last-child>div]:gap-1",
                // Preserve hover/selected styles for sticky cells
                "[&_tr:hover_td:last-child]:bg-muted/50",
                "[&_tr[data-state=selected]_td:last-child]:bg-muted",
                className
            )}
            {...props}
        />
    </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tbody
        ref={ref}
        className={cn("[&_tr:last-child]:border-0", className)}
        {...props}
    />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
    HTMLTableSectionElement,
    React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
    <tfoot
        ref={ref}
        className={cn(
            "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
            className
        )}
        {...props}
    />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
    HTMLTableRowElement,
    React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
    <tr
        ref={ref}
        className={cn(
            "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
            className
        )}
        {...props}
    />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
    HTMLTableCellElement,
    React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <th
        ref={ref}
        className={cn(
            "h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0",
            className
        )}
        {...props}
    />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
    HTMLTableCellElement,
    React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
    <td
        ref={ref}
        className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
        {...props}
    />
))
TableCell.displayName = "TableCell"

const TableCaption = React.forwardRef<
    HTMLTableCaptionElement,
    React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
    <caption
        ref={ref}
        className={cn("mt-4 text-sm text-muted-foreground", className)}
        {...props}
    />
))
TableCaption.displayName = "TableCaption"

export {
    Table,
    TableHeader,
    TableBody,
    TableFooter,
    TableHead,
    TableRow,
    TableCell,
    TableCaption,
}

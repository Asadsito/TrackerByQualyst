import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Bell, Calendar, ChevronRight } from 'lucide-react'
import moment from 'moment'

export default function ClosestReminders({ reminders = [], onReminderClick }) {
    const sortedReminders = [...reminders]
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)

    const getUrgencyStyles = (date) => {
        const daysUntil = moment(date).diff(moment(), 'days')
        if (daysUntil < 0) return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' }
        if (daysUntil <= 3) return { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' }
        if (daysUntil <= 7) return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' }
        return { bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-700', badge: 'bg-slate-100 text-slate-700' }
    }

    const formatDate = (date) => {
        const daysUntil = moment(date).diff(moment(), 'days')
        if (daysUntil < 0) return `${Math.abs(daysUntil)}d overdue`
        if (daysUntil === 0) return 'Today'
        if (daysUntil === 1) return 'Tomorrow'
        if (daysUntil <= 7) return `In ${daysUntil} days`
        return moment(date).format('MMM D')
    }

    if (reminders.length === 0) return null

    return (
        <Card className="border-0 shadow-lg shadow-slate-200/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Bell className="w-5 h-5 text-blue-600" />
                    Upcoming Reminders
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedReminders.map((reminder) => {
                    const styles = getUrgencyStyles(reminder.date)
                    return (
                        <div
                            key={reminder.id}
                            onClick={() => onReminderClick?.(reminder)}
                            className={`
                                flex items-center justify-between p-3 rounded-lg border cursor-pointer
                                hover:shadow-md transition-all
                                ${styles.bg} ${styles.border}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <Calendar className={`w-4 h-4 ${styles.text}`} />
                                <div>
                                    <p className="font-medium text-slate-800">{reminder.title}</p>
                                    <p className="text-xs text-slate-500">{reminder.itemName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className={styles.badge}>
                                    {formatDate(reminder.date)}
                                </Badge>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                        </div>
                    )
                })}
            </CardContent>
        </Card>
    )
}

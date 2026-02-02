import React from 'react'
import { Card } from "../ui/card"
import { Badge } from "../ui/badge"
import { 
    Car, Truck, Wrench, Package, Bike, Sailboat, 
    Plane, Tractor, Forklift, HardHat, Camera, Laptop,
    Plus, Bell
} from 'lucide-react'
import { motion } from 'framer-motion'
import moment from 'moment'

const iconMap = {
    car: Car,
    truck: Truck,
    wrench: Wrench,
    package: Package,
    bike: Bike,
    boat: Sailboat,
    plane: Plane,
    tractor: Tractor,
    forklift: Forklift,
    hardhat: HardHat,
    camera: Camera,
    laptop: Laptop,
}

export default function ItemGrid({ items = [], onItemClick, onAddItem }) {
    const getNextReminder = (item) => {
        if (!item.reminders || item.reminders.length === 0) return null
        const upcoming = item.reminders
            .filter(r => moment(r.date).isAfter(moment().subtract(1, 'day')))
            .sort((a, b) => new Date(a.date) - new Date(b.date))[0]
        return upcoming
    }

    const getReminderBadge = (reminder) => {
        if (!reminder) return null
        const daysUntil = moment(reminder.date).diff(moment(), 'days')
        if (daysUntil < 0) return { color: 'bg-red-500', text: 'Overdue' }
        if (daysUntil <= 3) return { color: 'bg-amber-500', text: `${daysUntil}d` }
        if (daysUntil <= 7) return { color: 'bg-blue-500', text: `${daysUntil}d` }
        return null
    }

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
            {items.map((item, index) => {
                const IconComponent = iconMap[item.icon] || Package
                const nextReminder = getNextReminder(item)
                const reminderBadge = getReminderBadge(nextReminder)

                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.03 }}
                        whileHover={{ scale: 1.03, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Card
                            onClick={() => onItemClick?.(item)}
                            className="
                                relative cursor-pointer border-0 
                                bg-white shadow-md shadow-slate-100
                                hover:shadow-xl hover:shadow-slate-200/50
                                transition-all duration-200
                                overflow-hidden group
                            "
                        >
                            {/* Reminder Badge */}
                            {reminderBadge && (
                                <div className={`absolute top-2 right-2 z-10`}>
                                    <Badge className={`${reminderBadge.color} text-white text-[10px] px-1.5 py-0.5 flex items-center gap-1`}>
                                        <Bell className="w-2.5 h-2.5" />
                                        {reminderBadge.text}
                                    </Badge>
                                </div>
                            )}

                            <div className="p-4 flex flex-col items-center">
                                {/* Icon Container */}
                                <div className={`
                                    w-[70px] h-[70px] md:w-20 md:h-20 rounded-2xl 
                                    flex items-center justify-center mb-3 overflow-hidden
                                    bg-gradient-to-br ${item.color || 'from-blue-500 to-blue-600'}
                                    shadow-lg group-hover:shadow-xl transition-shadow
                                `}>
                                    {item.custom_image ? (
                                        <img src={item.custom_image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <IconComponent className="w-9 h-9 md:w-10 md:h-10 text-white" />
                                    )}
                                </div>

                                {/* Item Name */}
                                <p className="text-sm font-medium text-slate-800 text-center truncate w-full">
                                    {item.name}
                                </p>

                                {/* Item Type / Category */}
                                <p className="text-xs text-slate-400 mt-0.5 truncate w-full text-center">
                                    {item.category || 'Asset'}
                                </p>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Card>
                    </motion.div>
                )
            })}

            {/* Add New Item Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: items.length * 0.03 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
            >
                <Card
                    onClick={onAddItem}
                    className="
                        cursor-pointer border-2 border-dashed border-slate-200
                        bg-slate-50/50 hover:bg-white hover:border-blue-300
                        transition-all duration-200 min-h-[140px]
                        flex items-center justify-center
                    "
                >
                    <div className="flex flex-col items-center text-slate-400 hover:text-blue-600 transition-colors">
                        <div className="w-12 h-12 rounded-full border-2 border-current flex items-center justify-center mb-2">
                            <Plus className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-medium">Add Item</p>
                    </div>
                </Card>
            </motion.div>
        </div>
    )
}

import React, { useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { UserPlus, Mail, Loader2, Check, Crown } from 'lucide-react'

export default function AddMemberDialog({ isOpen, onClose, userPlan, onAddMember }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    const canAddMembers = userPlan === 'pro'

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) return

        setLoading(true)
        setError('')

        try {
            await onAddMember(email)
            setSuccess(true)
            setTimeout(() => {
                setSuccess(false)
                setEmail('')
                onClose()
            }, 2000)
        } catch (err) {
            setError(err.message || 'Failed to add member')
        }
        setLoading(false)
    }

    const handleClose = () => {
        setEmail('')
        setError('')
        setSuccess(false)
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Add Team Member
                    </DialogTitle>
                    <DialogDescription>
                        {canAddMembers 
                            ? 'Invite a team member to collaborate on your rental items.'
                            : 'Upgrade to Pro to add team members.'}
                    </DialogDescription>
                </DialogHeader>

                {!canAddMembers ? (
                    <div className="py-6 text-center">
                        <Crown className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <p className="text-slate-600 mb-4">
                            Team members are available on the Pro plan.
                        </p>
                        <Button 
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                                handleClose()
                                window.location.href = '/#pricing'
                            }}
                        >
                            Upgrade to Pro
                        </Button>
                    </div>
                ) : success ? (
                    <div className="py-6 text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-green-600 font-medium">Invitation sent!</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="colleague@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Send Invite
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { Check, X, Sparkles, Zap, Crown } from 'lucide-react'

const plans = [
    {
        id: 'free',
        name: 'Free',
        price: '£0',
        description: 'For trying out',
        icon: Sparkles,
        color: 'from-slate-500 to-slate-600',
        stripePriceId: null,
        features: [
            'Up to 3 items',
            'Basic reminders',
            'Document uploads'
        ],
        limitations: [
            'No team members',
            'No priority support'
        ]
    },
    {
        id: 'starter',
        name: 'Starter',
        price: '£15',
        period: '/month',
        description: 'For small businesses',
        icon: Zap,
        color: 'from-blue-500 to-blue-600',
        popular: true,
        stripePriceId: 'price_starter_xxx', // Replace with your Stripe price ID
        features: [
            'Up to 25 items',
            'Advanced reminders',
            'Document uploads',
            'Email notifications'
        ],
        limitations: [
            'No team members'
        ]
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '£25',
        period: '/month',
        description: 'For growing teams',
        icon: Crown,
        color: 'from-purple-500 to-purple-600',
        stripePriceId: 'price_pro_xxx', // Replace with your Stripe price ID
        features: [
            'Unlimited items',
            'Advanced reminders',
            'Document uploads',
            'Email notifications',
            'Team members',
            'Priority support'
        ],
        limitations: []
    }
]

export default function PricingPlans({ currentPlan, onSelectPlan, onManagePlan }) {
    return (
        <div id="pricing">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">Choose Your Plan</h2>
                <p className="text-slate-500 mt-2">Scale as your business grows</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {plans.map((plan) => {
                    const Icon = plan.icon
                    const isCurrentPlan = currentPlan === plan.id

                    return (
                        <Card 
                            key={plan.id}
                            className={`relative border-2 transition-all ${
                                plan.popular ? 'border-blue-500 shadow-lg shadow-blue-100' : 'border-slate-200'
                            } ${isCurrentPlan ? 'ring-2 ring-green-500' : ''}`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600">
                                    Most Popular
                                </Badge>
                            )}
                            {isCurrentPlan && (
                                <Badge className="absolute -top-3 right-4 bg-green-600">
                                    Current Plan
                                </Badge>
                            )}

                            <CardHeader className="text-center pb-4">
                                <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <CardTitle>{plan.name}</CardTitle>
                                <CardDescription>{plan.description}</CardDescription>
                                <div className="mt-4">
                                    <span className="text-4xl font-bold">{plan.price}</span>
                                    {plan.period && <span className="text-slate-500">{plan.period}</span>}
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <Check className="w-4 h-4 text-green-500 shrink-0" />
                                            <span>{feature}</span>
                                        </div>
                                    ))}
                                    {plan.limitations.map((limitation, i) => (
                                        <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                            <X className="w-4 h-4 shrink-0" />
                                            <span>{limitation}</span>
                                        </div>
                                    ))}
                                </div>

                                <Button
                                    className={`w-full ${
                                        isCurrentPlan 
                                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                                            : plan.popular 
                                                ? 'bg-blue-600 hover:bg-blue-700' 
                                                : ''
                                    }`}
                                    variant={isCurrentPlan ? 'outline' : plan.popular ? 'default' : 'outline'}
                                    onClick={() => isCurrentPlan ? onManagePlan?.() : onSelectPlan?.(plan)}
                                >
                                    {isCurrentPlan ? 'Manage Plan' : plan.id === 'free' ? 'Get Started' : 'Upgrade'}
                                </Button>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}

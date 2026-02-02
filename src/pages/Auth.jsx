import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Truck, Mail, Lock, User, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Auth() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [message, setMessage] = useState('')
    
    const [loginData, setLoginData] = useState({ email: '', password: '' })
    const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' })

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        const { error } = await supabase.auth.signInWithPassword({
            email: loginData.email,
            password: loginData.password,
        })

        if (error) {
            setError(error.message)
        }
        setLoading(false)
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (signupData.password !== signupData.confirmPassword) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        const { data, error } = await supabase.auth.signUp({
            email: signupData.email,
            password: signupData.password,
            options: {
                data: {
                    full_name: signupData.name,
                }
            }
        })

        if (error) {
            setError(error.message)
        } else if (data?.user?.identities?.length === 0) {
            setError('An account with this email already exists')
        } else {
            setMessage('Check your email for the confirmation link!')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                        <Truck className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-slate-900">RentalHub</span>
                </div>

                <Card className="border-0 shadow-xl shadow-slate-200/50">
                    <Tabs defaultValue="login" className="w-full">
                        <CardHeader className="pb-4">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="login">Login</TabsTrigger>
                                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                            </TabsList>
                        </CardHeader>

                        <CardContent>
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                                    {error}
                                </div>
                            )}
                            {message && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg">
                                    {message}
                                </div>
                            )}

                            <TabsContent value="login" className="mt-0">
                                <form onSubmit={handleLogin} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="login-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="login-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={loginData.email}
                                                onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="login-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="login-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={loginData.password}
                                                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Sign In
                                    </Button>
                                </form>
                            </TabsContent>

                            <TabsContent value="signup" className="mt-0">
                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-name">Full Name</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="signup-name"
                                                type="text"
                                                placeholder="John Doe"
                                                value={signupData.name}
                                                onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-email">Email</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="signup-email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={signupData.email}
                                                onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-password">Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="signup-password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupData.password}
                                                onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="signup-confirm">Confirm Password</Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <Input
                                                id="signup-confirm"
                                                type="password"
                                                placeholder="••••••••"
                                                value={signupData.confirmPassword}
                                                onChange={(e) => setSignupData({...signupData, confirmPassword: e.target.value})}
                                                className="pl-10"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
                                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                        Create Account
                                    </Button>
                                </form>
                            </TabsContent>
                        </CardContent>
                    </Tabs>
                </Card>

                <p className="text-center text-sm text-slate-500 mt-6">
                    By continuing, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    )
}

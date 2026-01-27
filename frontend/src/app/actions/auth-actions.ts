'use server'

import prisma from '@/lib/prisma'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // In a real app, we would hash/verify the password
    const user = await prisma.usuario.findUnique({
        where: { email },
        include: {
            unidadePadrao: true
        }
    })

    if (!user || user.senha !== password) {
        return { success: false, error: 'Credenciais inválidas' }
    }

    if (!user.ativo) {
        return { success: false, error: 'Usuário desativado' }
    }

    // Set a simple cookie for "session"
    // In a real app, use JWT or a secure session store
    const sessionData = {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
        unidadeId: user.unidadePadraoId
    }

    const cookieStore = await cookies()
    cookieStore.set('session', JSON.stringify(sessionData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/'
    })

    return { success: true, perfil: user.perfil }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')
    if (!session) return null
    return JSON.parse(session.value)
}

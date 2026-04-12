import React from 'react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

global.React = React

const mockSupabase = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
    onAuthStateChange: vi.fn(() => ({ unsubscribe: vi.fn() })),
    signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    signUp: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user' } }, error: null }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
  },
}

vi.mock('../services/supabaseClient', () => ({
  supabase: mockSupabase,
}))
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

afterEach(() => {
  cleanup()
})

global.fetch = vi.fn()
global.TextEncoder = vi.fn()
global.TextDecoder = vi.fn()

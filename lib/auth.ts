import { type User, getUsers, saveUser, generateId } from "./db"

export interface AuthResponse {
  success: boolean
  message: string
  user?: Omit<User, "password">
  token?: string
}

export const login = (email: string, password: string): AuthResponse => {
  const users = getUsers()
  const user = users.find((u) => u.email === email && u.password === password)

  if (!user) {
    return {
      success: false,
      message: "Invalid email or password",
    }
  }

  const { password: _, ...userWithoutPassword } = user
  const token = btoa(JSON.stringify({ id: user.id, email: user.email, role: user.role }))

  return {
    success: true,
    message: "Login successful",
    user: userWithoutPassword,
    token,
  }
}

export const register = (fullname: string, email: string, password: string): AuthResponse => {
  const users = getUsers()
  const existingUser = users.find((u) => u.email === email)

  if (existingUser) {
    return {
      success: false,
      message: "User with this email already exists",
    }
  }

  const newUser: User = {
    id: generateId(),
    fullname,
    email,
    password, // In production, this would be hashed
    role: "user",
    createdAt: new Date().toISOString(),
  }

  saveUser(newUser)

  const { password: _, ...userWithoutPassword } = newUser
  const token = btoa(JSON.stringify({ id: newUser.id, email: newUser.email, role: newUser.role }))

  return {
    success: true,
    message: "Registration successful",
    user: userWithoutPassword,
    token,
  }
}

export const getCurrentUser = (token: string): Omit<User, "password"> | null => {
  try {
    const decoded = JSON.parse(atob(token))
    const users = getUsers()
    const user = users.find((u) => u.id === decoded.id)

    if (!user) return null

    const { password: _, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch {
    return null
  }
}

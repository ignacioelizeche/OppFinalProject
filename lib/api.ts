import type { CalendarEvent, Problem, AuthResponse, User, LeaderboardResponse, ProblemAttempt } from "@/lib/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:18080/api"
const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

// Google Calendar scopes for OAuth
const GOOGLE_CALENDAR_SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
]

// Storage keys
const STORAGE_KEYS = {
  USERS: "delta_users",
  CURRENT_USER: "delta_current_user",
  PROBLEM_ATTEMPTS: "delta_problem_attempts",
  GOOGLE_AUTH: "delta_google_auth",
}

// Mock data for calendar events
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 1,
    title: "Algebra Lecture",
    description: "Introduction to quadratic equations",
    eventType: "lecture",
    startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    title: "Calculus Exam",
    description: "Mid-term examination covering derivatives and integrals",
    eventType: "exam",
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    title: "Statistics Workshop",
    description: "Practical workshop on probability and distributions",
    eventType: "workshop",
    startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
  },
]

// Helper functions for Google Calendar integration
const googleCalendarHelpers = {
  // Load the Google API client library
  loadGoogleApi: async (): Promise<void> => {
    if (typeof window === 'undefined' || !GOOGLE_API_KEY || !GOOGLE_CLIENT_ID) return

    return new Promise((resolve, reject) => {
      // Check if gapi is already loaded
      if (window.gapi && window.gapi.client) {
        resolve()
        return
      }

      // Load gapi script
      const script = document.createElement('script')
      script.src = 'https://apis.google.com/js/api.js'
      script.onload = () => {
        window.gapi.load('client:auth2', async () => {
          try {
            await window.gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              clientId: GOOGLE_CLIENT_ID,
              discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
              scope: GOOGLE_CALENDAR_SCOPES.join(' ')
            })
            resolve()
          } catch (error) {
            console.error('Error initializing Google API client:', error)
            reject(error)
          }
        })
      }
      script.onerror = (error) => {
        console.error('Error loading Google API script:', error)
        reject(error)
      }
      document.body.appendChild(script)
    })
  },

  // Sign in to Google account
  signInToGoogle: async (): Promise<gapi.auth2.GoogleUser> => {
    await googleCalendarHelpers.loadGoogleApi()
    try {
      const authInstance = gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()
      
      // Store auth token in localStorage
      const token = user.getAuthResponse().id_token
      localStorage.setItem(STORAGE_KEYS.GOOGLE_AUTH, token)
      
      return user
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  },

  // Check if user is signed in to Google
  isSignedInToGoogle: (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      const authInstance = gapi.auth2.getAuthInstance()
      return authInstance && authInstance.isSignedIn.get()
    } catch (error) {
      return false
    }
  },

  // Sign out from Google account
  signOutFromGoogle: async (): Promise<void> => {
    if (typeof window === 'undefined') return
    
    try {
      const authInstance = gapi.auth2.getAuthInstance()
      if (authInstance) {
        await authInstance.signOut()
        localStorage.removeItem(STORAGE_KEYS.GOOGLE_AUTH)
      }
    } catch (error) {
      console.error('Google sign out error:', error)
      throw error
    }
  },

  // Convert our event format to Google Calendar event format
  toGoogleCalendarEvent: (event: CalendarEvent): gapi.client.calendar.Event => {
    return {
      summary: event.title,
      description: event.description,
      start: {
        dateTime: event.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      // Use eventType as a colorId (Google Calendar uses numeric colorIds)
      colorId: event.eventType === 'lecture' ? '1' : 
               event.eventType === 'exam' ? '4' : 
               event.eventType === 'workshop' ? '2' : '0',
      // Add custom properties if needed
      extendedProperties: {
        private: {
          eventType: event.eventType,
          platformEventId: event.id?.toString() || ''
        }
      }
    }
  },

  // Convert Google Calendar event to our format
  fromGoogleCalendarEvent: (googleEvent: gapi.client.calendar.Event): CalendarEvent => {
    const eventType = googleEvent.extendedProperties?.private?.eventType || 'other'
    
    return {
      id: parseInt(googleEvent.extendedProperties?.private?.platformEventId || '0') || 0,
      googleEventId: googleEvent.id || '',
      title: googleEvent.summary || '',
      description: googleEvent.description || '',
      eventType: eventType as 'lecture' | 'exam' | 'workshop' | 'other',
      startTime: googleEvent.start?.dateTime || '',
      endTime: googleEvent.end?.dateTime || '',
      location: googleEvent.location || undefined,
      googleCalendarId: googleEvent.organizer?.email || undefined
    }
  }
}

// Mock API function that doesn't actually make network requests
async function mockFetchAPI(endpoint: string, options: RequestInit = {}) {
  console.log(`Mock API call to ${endpoint}`, options)

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Calendar endpoints
  if (endpoint.startsWith("/calendar")) {
    // Get events
    if (endpoint.includes("/events") && !options.method) {
      return MOCK_EVENTS
    }
    
    // Create event
    if (endpoint.includes("/events") && options.method === "POST") {
      const eventData = JSON.parse(options.body as string)
      const newEvent = {
        id: Date.now(),
        ...eventData
      }
      
      MOCK_EVENTS.push(newEvent)
      return newEvent
    }
    
    // Update event
    if (endpoint.match(/\/calendar\/events\/\d+$/) && options.method === "PUT") {
      const eventId = parseInt(endpoint.split('/').pop() || '0')
      const eventData = JSON.parse(options.body as string)
      
      const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId)
      if (eventIndex !== -1) {
        MOCK_EVENTS[eventIndex] = { ...MOCK_EVENTS[eventIndex], ...eventData }
        return MOCK_EVENTS[eventIndex]
      }
      
      throw new Error("Event not found")
    }
    
    // Delete event
    if (endpoint.match(/\/calendar\/events\/\d+$/) && options.method === "DELETE") {
      const eventId = parseInt(endpoint.split('/').pop() || '0')
      
      const eventIndex = MOCK_EVENTS.findIndex(event => event.id === eventId)
      if (eventIndex !== -1) {
        const deletedEvent = MOCK_EVENTS[eventIndex]
        MOCK_EVENTS.splice(eventIndex, 1)
        return { success: true, deletedEvent }
      }
      
      throw new Error("Event not found")
    }
    
    // Create recurring events
    if (endpoint.includes("/events/recurring") && options.method === "POST") {
      const { recurrence, ...eventData } = JSON.parse(options.body as string)
      
      // Create a series of events based on recurrence pattern
      const newEvents = []
      const startDate = new Date(eventData.startTime)
      const endDate = new Date(eventData.endTime)
      const duration = endDate.getTime() - startDate.getTime()
      
      const maxOccurrences = recurrence.occurrences || 10 // default to 10 if not specified
      
      for (let i = 0; i < maxOccurrences; i++) {
        const newStartDate = new Date(startDate)
        
        // Apply recurrence pattern
        switch (recurrence.frequency) {
          case 'daily':
            newStartDate.setDate(startDate.getDate() + (i * recurrence.interval))
            break
          case 'weekly':
            newStartDate.setDate(startDate.getDate() + (i * 7 * recurrence.interval))
            break
          case 'monthly':
            newStartDate.setMonth(startDate.getMonth() + (i * recurrence.interval))
            break
          case 'yearly':
            newStartDate.setFullYear(startDate.getFullYear() + (i * recurrence.interval))
            break
        }
        
        // If end date is set and we've passed it, stop creating events
        if (recurrence.endDate && new Date(recurrence.endDate) < newStartDate) {
          break
        }
        
        const newEndDate = new Date(newStartDate.getTime() + duration)
        
        const newEvent = {
          id: Date.now() + i,
          ...eventData,
          startTime: newStartDate.toISOString(),
          endTime: newEndDate.toISOString(),
          isRecurring: true,
          recurrenceGroupId: Date.now()
        }
        
        MOCK_EVENTS.push(newEvent)
        newEvents.push(newEvent)
      }
      
      return newEvents
    }
    
    // Batch create events
    if (endpoint.includes("/events/batch") && options.method === "POST") {
      const { events } = JSON.parse(options.body as string)
      const createdEvents = []
      
      for (const eventData of events) {
        const newEvent = {
          id: Date.now() + Math.floor(Math.random() * 1000),
          ...eventData
        }
        
        MOCK_EVENTS.push(newEvent)
        createdEvents.push(newEvent)
      }
      
      return createdEvents
    }
    
    // Get professor events
    if (endpoint.match(/\/calendar\/professor\/\d+\/events/)) {
      const professorId = parseInt(endpoint.split('/')[3])
      // In a real app, we would filter by professor ID
      // For mock purposes, we'll just return all events
      return MOCK_EVENTS
    }
  }

  // Default response
  return { success: true }
}

// Extended Calendar API calls with Google Calendar integration
export const calendarAPI = {
  // Basic CRUD operations for calendar events
  getEvents: async (start: string, end: string) => {
    return mockFetchAPI(`/calendar/events?start=${start}&end=${end}`) as Promise<CalendarEvent[]>
  },

  createEvent: async (eventData: Omit<CalendarEvent, "id">) => {
    return mockFetchAPI("/calendar/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    }) as Promise<CalendarEvent>
  },

  updateEvent: async (id: number, eventData: Partial<CalendarEvent>) => {
    return mockFetchAPI(`/calendar/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    }) as Promise<CalendarEvent>
  },

  deleteEvent: async (id: number) => {
    return mockFetchAPI(`/calendar/events/${id}`, {
      method: "DELETE",
    }) as Promise<{ success: boolean, deletedEvent: CalendarEvent }>
  },
  
  // Enhanced functionality for professors
  getProfessorEvents: async (professorId: number, start: string, end: string) => {
    return mockFetchAPI(`/calendar/professor/${professorId}/events?start=${start}&end=${end}`) as Promise<CalendarEvent[]>
  },
  
  createRecurringEvent: async (eventData: Omit<CalendarEvent, "id"> & { 
    recurrence: {
      frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
      interval: number,
      endDate?: string,
      occurrences?: number
    } 
  }) => {
    return mockFetchAPI("/calendar/events/recurring", {
      method: "POST",
      body: JSON.stringify(eventData),
    }) as Promise<CalendarEvent[]>
  },
  
  batchCreateEvents: async (events: Array<Omit<CalendarEvent, "id">>) => {
    return mockFetchAPI("/calendar/events/batch", {
      method: "POST",
      body: JSON.stringify({ events }),
    }) as Promise<CalendarEvent[]>
  },
  
  // Google Calendar integration
  googleCalendar: {
    // Initialize Google API
    init: async () => {
      return googleCalendarHelpers.loadGoogleApi()
    },
    
    // Sign in to Google
    signIn: async () => {
      return googleCalendarHelpers.signInToGoogle()
    },
    
    // Check if signed in
    isSignedIn: () => {
      return googleCalendarHelpers.isSignedInToGoogle()
    },
    
    // Sign out from Google
    signOut: async () => {
      return googleCalendarHelpers.signOutFromGoogle()
    },
    
    // List user's calendars
    listCalendars: async () => {
      if (!googleCalendarHelpers.isSignedInToGoogle()) {
        throw new Error("User not signed in to Google")
      }
      
      try {
        const response = await gapi.client.calendar.calendarList.list()
        return response.result.items || []
      } catch (error) {
        console.error('Error listing Google calendars:', error)
        throw error
      }
    },
    
    // Get events from Google Calendar
    getGoogleEvents: async (calendarId = 'primary', timeMin?: string, timeMax?: string) => {
      if (!googleCalendarHelpers.isSignedInToGoogle()) {
        throw new Error("User not signed in to Google")
      }
      
      try {
        const now = new Date()
        const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
        
        const response = await gapi.client.calendar.events.list({
          calendarId,
          timeMin: timeMin || now.toISOString(),
          timeMax: timeMax || oneMonthFromNow.toISOString(),
          singleEvents: true,
          orderBy: 'startTime'
        })
        
        // Convert Google events to our format
        return (response.result.items || []).map(googleCalendarHelpers.fromGoogleCalendarEvent)
      } catch (error) {
        console.error('Error getting Google calendar events:', error)
        throw error
      }
    },
    
    // Create event in Google Calendar
    createGoogleEvent: async (calendarId = 'primary', event: CalendarEvent) => {
      if (!googleCalendarHelpers.isSignedInToGoogle()) {
        throw new Error("User not signed in to Google")
      }
      
      try {
        const googleEvent = googleCalendarHelpers.toGoogleCalendarEvent(event)
        const response = await gapi.client.calendar.events.insert({
          calendarId,
          resource: googleEvent
        })
        
        // Return the created event converted to our format
        return googleCalendarHelpers.fromGoogleCalendarEvent(response.result)
      } catch (error) {
        console.error('Error creating Google calendar event:', error)
        throw error
      }
    },
    
    // Create event in both our system and Google Calendar
    createSyncedEvent: async (eventData: Omit<CalendarEvent, "id">, googleCalendarId = 'primary') => {
      try {
        // First create in our system
        const createdEvent = await calendarAPI.createEvent(eventData) as CalendarEvent
        
        // Then create in Google Calendar if user is signed in
        if (googleCalendarHelpers.isSignedInToGoogle()) {
          const googleEvent = await calendarAPI.googleCalendar.createGoogleEvent(googleCalendarId, createdEvent)
          
          // Update our event with Google Calendar ID
          if (googleEvent.googleEventId) {
            await calendarAPI.updateEvent(createdEvent.id as number, { 
              googleEventId: googleEvent.googleEventId,
              googleCalendarId 
            })
            
            return { ...createdEvent, googleEventId: googleEvent.googleEventId, googleCalendarId }
          }
        }
        
        return createdEvent
      } catch (error) {
        console.error('Error creating synced event:', error)
        throw error
      }
    },
    
    // Update event in Google Calendar
    updateGoogleEvent: async (calendarId: string, eventId: string, eventData: Partial<CalendarEvent>) => {
      if (!googleCalendarHelpers.isSignedInToGoogle()) {
        throw new Error("User not signed in to Google")
      }
      
      try {
        // Get the current event first
        const getResponse = await gapi.client.calendar.events.get({
          calendarId,
          eventId
        })
        
        const currentEvent = getResponse.result
        const updatedEvent = { ...currentEvent }
        
        // Update fields based on eventData
        if (eventData.title) updatedEvent.summary = eventData.title
        if (eventData.description) updatedEvent.description = eventData.description
        if (eventData.startTime) {
          updatedEvent.start = {
            dateTime: eventData.startTime,
            timeZone: currentEvent.start?.timeZone
          }
        }
        if (eventData.endTime) {
          updatedEvent.end = {
            dateTime: eventData.endTime,
            timeZone: currentEvent.end?.timeZone
          }
        }
        if (eventData.location) updatedEvent.location = eventData.location
        
        // Update event type in extended properties
        if (eventData.eventType && updatedEvent.extendedProperties) {
          if (!updatedEvent.extendedProperties.private) {
            updatedEvent.extendedProperties.private = {}
          }
          updatedEvent.extendedProperties.private.eventType = eventData.eventType
        }
        
        const response = await gapi.client.calendar.events.update({
          calendarId,
          eventId,
          resource: updatedEvent
        })
        
        return googleCalendarHelpers.fromGoogleCalendarEvent(response.result)
      } catch (error) {
        console.error('Error updating Google calendar event:', error)
        throw error
      }
    },
    
    // Delete event from Google Calendar
    deleteGoogleEvent: async (calendarId: string, eventId: string) => {
      if (!googleCalendarHelpers.isSignedInToGoogle()) {
        throw new Error("User not signed in to Google")
      }
      
      try {
        await gapi.client.calendar.events.delete({
          calendarId,
          eventId
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error deleting Google calendar event:', error)
        throw error
      }
    },
    
    // Import events from Google Calendar to our system
    importFromGoogle: async (calendarId = 'primary', timeMin?: string, timeMax?: string) => {
      try {
        // Get events from Google Calendar
        const googleEvents = await calendarAPI.googleCalendar.getGoogleEvents(calendarId, timeMin, timeMax)
        
        // Filter out events that already exist in our system (by googleEventId)
        const newEvents = googleEvents.filter(event => !!event.googleEventId && !MOCK_EVENTS.some(
          e => e.googleEventId === event.googleEventId
        ))
        
        // Create events in our system
        if (newEvents.length > 0) {
          await calendarAPI.batchCreateEvents(newEvents)
        }
        
        return newEvents
      } catch (error) {
        console.error('Error importing events from Google:', error)
        throw error
      }
    },
    
    // Export events from our system to Google Calendar
    exportToGoogle: async (calendarId = 'primary', events?: CalendarEvent[]) => {
      try {
        if (!googleCalendarHelpers.isSignedInToGoogle()) {
          throw new Error("User not signed in to Google")
        }
        
        // Use provided events or get all events from our system
        const eventsToExport = events || await calendarAPI.getEvents(
          new Date().toISOString(),
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        )
        
        // Filter out events that already exist in Google Calendar
        const newEvents = eventsToExport.filter(event => !event.googleEventId)
        
        // Create events in Google Calendar
        const createdEvents = []
        
        for (const event of newEvents) {
          const googleEvent = await calendarAPI.googleCalendar.createGoogleEvent(calendarId, event)
          
          // Update our event with Google Calendar ID
          if (googleEvent.googleEventId && event.id) {
            await calendarAPI.updateEvent(event.id, { 
              googleEventId: googleEvent.googleEventId,
              googleCalendarId: calendarId 
            })
          }
          
          createdEvents.push(googleEvent)
        }
        
        return createdEvents
      } catch (error) {
        console.error('Error exporting events to Google:', error)
        throw error
      }
    }
  }
}

// Type declaration for the Google API
declare global {
  interface Window {
    gapi: {
      load: (api: string, callback: () => void) => void
      client: {
        init: (params: {
          apiKey: string
          clientId: string
          discoveryDocs: string[]
          scope: string
        }) => Promise<void>
        calendar: {
          calendarList: {
            list: () => Promise<{
              result: {
                items?: Array<{
                  id: string
                  summary: string
                  primary?: boolean
                }>
              }
            }>
          }
          events: {
            list: (params: {
              calendarId: string
              timeMin: string
              timeMax: string
              singleEvents: boolean
              orderBy: string
            }) => Promise<{
              result: {
                items?: gapi.client.calendar.Event[]
              }
            }>
            get: (params: {
              calendarId: string
              eventId: string
            }) => Promise<{
              result: gapi.client.calendar.Event
            }>
            insert: (params: {
              calendarId: string
              resource: gapi.client.calendar.Event
            }) => Promise<{
              result: gapi.client.calendar.Event
            }>
            update: (params: {
              calendarId: string
              eventId: string
              resource: gapi.client.calendar.Event
            }) => Promise<{
              result: gapi.client.calendar.Event
            }>
            delete: (params: {
              calendarId: string
              eventId: string
            }) => Promise<void>
          }
        }
      }
      auth2: {
        getAuthInstance: () => {
          isSignedIn: {
            get: () => boolean
          }
          signIn: () => Promise<gapi.auth2.GoogleUser>
          signOut: () => Promise<void>
        }
      }
    }
  }
}

namespace gapi.client.calendar {
  export interface Event {
    id?: string
    summary?: string
    description?: string
    location?: string
    start?: {
      dateTime: string
      timeZone?: string
    }
    end?: {
      dateTime: string
      timeZone?: string
    }
    colorId?: string
    organizer?: {
      email?: string
      displayName?: string
    }
    extendedProperties?: {
      private?: {
        [key: string]: string
      }
    }
  }
}

namespace gapi.auth2 {
  export interface GoogleUser {
    getAuthResponse: () => {
      id_token: string
      access_token: string
      expires_at: number
    }
    getBasicProfile: () => {
      getId: () => string
      getName: () => string
      getEmail: () => string
    }
  }
}

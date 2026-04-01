const en = {
    // ─── Common ──────────────────────────────────────────────
    common: {
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        loading: 'Loading...',
        processing: 'Processing...',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        search: 'Search',
        noResults: 'No results found',
        error: 'Something went wrong',
        success: 'Success',
        required: 'Required',
        optional: 'Optional',
        yes: 'Yes',
        no: 'No',
        close: 'Close',
        actions: 'Actions',
        status: 'Status',
        date: 'Date',
        time: 'Time',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        price: 'Price',
        total: 'Total',
        all: 'All',
        today: 'Today',
        tomorrow: 'Tomorrow',
        poweredBy: 'Powered by BookEase',
    },

    // ─── Auth ────────────────────────────────────────────────
    auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        forgotPassword: 'Forgot Password',
        resetPassword: 'Reset Password',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        loginTitle: 'Welcome back',
        loginSubtitle: 'Sign in to your account',
        registerTitle: 'Create Account',
        registerSubtitle: 'Start managing your bookings',
        noAccount: "Don't have an account?",
        hasAccount: 'Already have an account?',
        signUp: 'Sign Up',
        signIn: 'Sign In',
        phoneOrEmail: 'Phone or Email',
        sendResetCode: 'Send Reset Code',
        verifyCode: 'Verify Code',
        enterOtp: 'Enter the verification code',
        newPassword: 'New Password',
        passwordUpdated: 'Password updated successfully',
        loginFailed: 'Login failed',
        signupFailed: 'Signup failed',
    },

    // ─── Booking (public page) ────────────────────────────────
    booking: {
        bookNow: 'Book Now',
        bookAppointment: 'Book Appointment',
        selectDate: 'Select Date',
        pickTime: 'Pick a Time',
        loadingSlots: 'Loading slots...',
        noSlots: 'No slots available for this date',
        tryAnotherDate: 'Try another date',
        yourSelection: 'Your Selection',
        fullName: 'Full Name',
        enterName: 'Enter your full name',
        phoneNumber: 'Phone Number',
        confirmBooking: 'Confirm Booking',
        confirmAndPay: 'Confirm & Pay',
        payOnline: 'Pay Online',
        bookWithoutPayment: 'Book Without Payment',
        payOnlineHint: 'Pay online for instant confirmation, or book now and pay later in person.',
        paymentRequiredHint: "Secure payment via SSLCommerz. You'll be redirected to complete payment.",
        manualHint: 'Your booking will be confirmed instantly. Payment can be made in person.',
        bookingConfirmed: 'Booking Confirmed!',
        bookingConfirmedMessage: 'Your appointment has been successfully booked.',
        wellContactYou: "We'll contact you at",
        appointmentDetails: 'Appointment Details:',
        bookAnother: 'Book Another Appointment',
        aboutUs: 'About Us',
        gallery: 'Gallery',
        businessNotFound: 'Business Not Found',
        checkUrl: 'Please check the URL and try again.',
    },

    // ─── Dashboard ───────────────────────────────────────────
    dashboard: {
        title: 'Dashboard',
        calendar: 'Calendar',
        schedules: 'Schedules',
        sales: 'Sales',
        myPage: 'My Page',
        customers: 'Customers',
        campaigns: 'Campaigns',
        team: 'Team',
        auditLog: 'Audit Log',
        settings: 'Settings',

        // Stats
        todayAppointments: "Today's Appointments",
        monthlyRevenue: 'Monthly Revenue',
        totalBookings: 'Total Bookings',
        yearlyRevenue: 'Yearly Revenue',

        // Running appointments
        activeAppointments: "Today's Active Appointments",
        noActiveAppointments: 'No active appointments right now',

        // Booking link
        bookingLink: 'Your Booking Link',
        copyLink: 'Copy Link',
        copied: 'Copied!',
        shareLink: 'Share this link with your customers',

        // Appointments list
        allAppointments: 'All Appointments',
        allStatus: 'All Status',
        confirmed: 'Confirmed',
        pending: 'Pending',
        completed: 'Completed',
        cancelled: 'Cancelled',
        expired: 'Expired',
        markComplete: 'Complete',
        cancelAppointment: 'Cancel',
        noAppointments: 'No appointments found',
        appointmentCancelled: 'Appointment cancelled',
        appointmentCompleted: 'Appointment marked as completed',

        // Manual booking
        bookSlot: 'Book Slot',
        manualBooking: 'Manual Booking',
        customerName: 'Customer Name',
        customerPhone: 'Customer Phone',
        customerEmail: 'Customer Email (optional)',
        appointmentDate: 'Appointment Date',
        selectTime: 'Select Time',
        notes: 'Notes (optional)',
        bookAppointment: 'Book Appointment',
        booking: 'Booking...',
        bookedSuccessfully: 'Appointment booked successfully',

        // Cancel modal
        cancelReason: 'Reason for cancellation',
        cancelReasonPlaceholder: 'Why is this appointment being cancelled?',
        confirmCancel: 'Confirm Cancel',
    },

    // ─── Calendar ────────────────────────────────────────────
    calendar: {
        title: 'Calendar',
        monthView: 'Month',
        weekView: 'Week',
        daySlots: 'Day Slots',
        selectDay: 'Select a day to view slots',
        noSchedule: 'No schedule for this day',
        available: 'Available',
        booked: 'Booked',
    },

    // ─── Schedules ───────────────────────────────────────────
    schedules: {
        title: 'Schedules',
        addSchedule: 'Add Schedule',
        editSchedule: 'Edit Schedule',
        scheduleName: 'Schedule Name',
        dayOfWeek: 'Day of Week',
        startTime: 'Start Time',
        endTime: 'End Time',
        slotDuration: 'Slot Duration',
        minutes: 'minutes',
        active: 'Active',
        inactive: 'Inactive',
        breaks: 'Breaks',
        addBreak: 'Add Break',
        noSchedules: 'No schedules configured',
        days: {
            sunday: 'Sunday',
            monday: 'Monday',
            tuesday: 'Tuesday',
            wednesday: 'Wednesday',
            thursday: 'Thursday',
            friday: 'Friday',
            saturday: 'Saturday',
        },
    },

    // ─── Sales ───────────────────────────────────────────────
    sales: {
        title: 'Sales Report',
        from: 'From',
        to: 'To',
        daily: 'Daily',
        weekly: 'Weekly',
        monthly: 'Monthly',
        grandTotal: 'Grand Total',
        totalAppointments: 'Total Appointments',
        noSalesData: 'No sales data for this period',
        generateReport: 'Generate Report',
    },

    // ─── Customers ───────────────────────────────────────────
    customers: {
        title: 'Customers',
        searchPlaceholder: 'Search by name or phone...',
        totalBookings: 'Total Bookings',
        totalSpent: 'Total Spent',
        lastVisit: 'Last Visit',
        noCustomers: 'No customers found',
        sortByName: 'Name',
        sortByBookings: 'Bookings',
        sortBySpent: 'Spent',
        sortByRecent: 'Recent',
    },

    // ─── Campaigns ───────────────────────────────────────────
    campaigns: {
        title: 'Campaigns',
        newCampaign: 'New Campaign',
        campaignTitle: 'Campaign Title',
        message: 'Message',
        channel: 'Channel',
        sms: 'SMS',
        emailChannel: 'Email',
        both: 'Both',
        send: 'Send Campaign',
        sent: 'Sent',
        draft: 'Draft',
        failed: 'Failed',
        sentTo: 'Sent to',
        customersReached: 'customers',
        noCampaigns: 'No campaigns yet',
    },

    // ─── Team ────────────────────────────────────────────────
    team: {
        title: 'Team Members',
        addMember: 'Add Member',
        firstName: 'First Name',
        lastName: 'Last Name',
        role: 'Role',
        owner: 'Owner',
        admin: 'Admin',
        activeStatus: 'Active',
        deactivated: 'Deactivated',
        activate: 'Activate',
        deactivate: 'Deactivate',
        resetPassword: 'Reset Password',
        noMembers: 'No team members',
        memberAdded: 'Team member added',
        planLimit: 'Plan limit reached',
    },

    // ─── Audit Log ───────────────────────────────────────────
    auditLog: {
        title: 'Audit Log',
        action: 'Action',
        resource: 'Resource',
        user: 'User',
        details: 'Details',
        noLogs: 'No audit logs found',
        created: 'Created',
        updated: 'Updated',
        deleted: 'Deleted',
        cancelledAction: 'Cancelled',
    },

    // ─── Settings ────────────────────────────────────────────
    settings: {
        title: 'Settings',
        general: 'General',
        bookingSettings: 'Booking',
        payment: 'Payment',
        language: 'Language',

        // General
        generalDescription: 'Basic information about your business',
        businessName: 'Business Name',
        businessEmail: 'Business Email',
        emailHint: 'Used for business communications',
        subdomain: 'Subdomain',
        subdomainHint: 'Subdomain cannot be changed after creation',
        saveChanges: 'Save Changes',

        // Booking mode
        bookingModeTitle: 'Booking Mode',
        bookingModeDescription: 'Control how customers book appointments',
        paymentRequired: 'Payment Required',
        paymentRequiredDescription: 'Customers must pay online via SSLCommerz to confirm their booking.',
        manualOnly: 'Manual Only',
        manualOnlyDescription: 'Bookings are confirmed instantly without online payment. Collect payment in person.',
        bothOptions: 'Both Options',
        bothOptionsDescription: 'Customers can choose to pay online or book without payment.',
        saveBookingMode: 'Save Booking Mode',

        // Payment
        paymentGateway: 'Payment Gateway',
        paymentGatewayDescription: 'Configure SSLCommerz for receiving online payments',
        storeId: 'Store ID',
        storeIdHint: 'Your SSLCommerz Store ID (Public Key)',
        storePassword: 'Store Password',
        storePasswordHint: 'Your SSLCommerz Store Password (Secret Key)',
        sandboxMode: 'Sandbox Mode',
        sandboxHint: 'Enable for testing with dummy credentials',
        saveConfiguration: 'Save Configuration',
        gatewayActive: 'Active',
        gatewayInactive: 'Inactive',

        // Language
        languageTitle: 'Language',
        languageDescription: 'Set the default language for your booking page',
        english: 'English',
        bangla: 'বাংলা (Bangla)',
        saveLanguage: 'Save Language',
    },

    // ─── Onboarding ──────────────────────────────────────────
    onboarding: {
        title: 'Set Up Your Business',
        businessName: 'Business Name',
        businessNamePlaceholder: 'e.g. Star Salon',
        subdomain: 'Choose your booking URL',
        subdomainAvailable: 'Available!',
        subdomainTaken: 'Already taken',
        launch: 'Launch My Booking Page',
    },

    // ─── Pagination ──────────────────────────────────────────
    pagination: {
        previous: 'Previous',
        next: 'Next',
        page: 'Page',
        of: 'of',
    },
} as const;

// Deep-writable version: same shape as `en` but every leaf is `string`
type DeepString<T> = {
    [K in keyof T]: T[K] extends string ? string : DeepString<T[K]>;
};

export type TranslationKeys = DeepString<typeof en>;
export default en;

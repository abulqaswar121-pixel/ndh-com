import type { ComponentType } from 'react'
import { WelcomeTemplate } from './WelcomeTemplate'
import { TaskSubmittedTemplate } from './TaskSubmittedTemplate'
import { PmAssignedTemplate } from './PmAssignedTemplate'
import { QuoteSentTemplate } from './QuoteSentTemplate'
import { PaymentReceivedTemplate } from './PaymentReceivedTemplate'
import { TaskDeliveredTemplate } from './TaskDeliveredTemplate'
import { template as talentInvitation } from './TalentInvitationTemplate'
import { template as talentTaskAssigned } from './TalentTaskAssignedTemplate'
import { template as talentRevision } from './TalentRevisionTemplate'
import { template as talentPayment } from './TalentPaymentTemplate'

export interface TemplateEntry {
  component: ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
export const TEMPLATES: Record<string, TemplateEntry> = {
  welcome: {
    component: WelcomeTemplate,
    subject: 'Welcome to Najeeb Digital Hub 🚀',
    displayName: 'Welcome',
    previewData: { name: 'Aisha', dashboardUrl: 'https://ndh.com.ng/dashboard/client' },
  },
  task_submitted: {
    component: TaskSubmittedTemplate,
    subject: 'Your task has been received — NDH',
    displayName: 'Task Submitted',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      category: 'design',
      tier: 'professional',
      pmName: 'Yusuf (Design PM)',
    },
  },
  pm_assigned: {
    component: PmAssignedTemplate,
    subject: (d: Record<string, any>) => `New task assigned to you — ${d.taskTitle || 'NDH'}`,
    displayName: 'PM Notification',
    previewData: {
      pmName: 'Yusuf',
      taskTitle: 'New brand identity',
      category: 'design',
      tier: 'professional',
      clientName: 'Aisha',
      budgetRange: '₦200,000 – ₦500,000',
      deadline: 'Dec 31, 2025',
    },
  },
  quote_sent: {
    component: QuoteSentTemplate,
    subject: 'Quote ready for your task — NDH',
    displayName: 'Quote Sent',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      amount: '₦350,000',
      notes: 'Includes 2 revision rounds.',
    },
  },
  payment_received: {
    component: PaymentReceivedTemplate,
    subject: 'Payment confirmed — Work is starting',
    displayName: 'Payment Received',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      amount: '₦350,000',
      reference: 'NDH-1736000000-AB12CD',
    },
  },
  task_delivered: {
    component: TaskDeliveredTemplate,
    subject: 'Your task is ready for review',
    displayName: 'Task Delivered',
    previewData: {
      clientName: 'Aisha',
      taskTitle: 'New brand identity',
      pmName: 'Yusuf',
    },
  },
  talent_invitation: talentInvitation,
  talent_task_assigned: talentTaskAssigned,
  talent_revision_required: talentRevision,
  talent_payment_processed: talentPayment,
}

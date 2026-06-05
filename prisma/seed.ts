import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.contact.count()
  if (existing > 0) return

  const maria = await prisma.contact.create({
    data: {
      fullName: 'Maria Lopez',
      firstName: 'Maria',
      lastName: 'Lopez',
      email: 'maria@example.com',
      phone: '+15555550101',
      county: 'Miami-Dade',
      primarySource: 'Website',
      primaryMedium: 'Organic',
      leadScore: 85,
      lastActivityAt: new Date(),
    },
  })

  const john = await prisma.contact.create({
    data: {
      fullName: 'John Carter',
      firstName: 'John',
      lastName: 'Carter',
      email: 'john@example.com',
      phone: '+15555550102',
      county: 'Broward',
      primarySource: 'Calendly',
      primaryMedium: 'Scheduling',
      leadScore: 62,
      lastActivityAt: new Date(),
    },
  })

  const mariaInquiry = await prisma.inquiry.create({
    data: { contactId: maria.id, stage: 'Qualified', productInterest: 'Term_Life', source: 'Website', medium: 'Organic', county: maria.county, leadScore: 85, notes: 'Requested a life insurance consultation.' },
  })

  const johnInquiry = await prisma.inquiry.create({
    data: { contactId: john.id, stage: 'Booked', productInterest: 'Final_Expense', source: 'Calendly', medium: 'Scheduling', county: john.county, leadScore: 62, notes: 'Booked a consultation call.' },
  })

  await prisma.task.createMany({
    data: [
      { contactId: maria.id, inquiryId: mariaInquiry.id, title: 'Send quote follow-up', status: 'Open', dueAt: new Date(Date.now() + 86400000) },
      { contactId: john.id, inquiryId: johnInquiry.id, title: 'Prepare for booked appointment', status: 'Open', dueAt: new Date(Date.now() + 2 * 86400000) },
    ],
  })

  const thread = await prisma.conversationThread.create({
    data: { contactId: john.id, inquiryId: johnInquiry.id, channel: 'sms', lastMessageAt: new Date(), lastInboundAt: new Date() },
  })

  await prisma.conversationMessage.create({
    data: { threadId: thread.id, contactId: john.id, inquiryId: johnInquiry.id, channel: 'sms', direction: 'inbound', status: 'received', bodyText: 'Looking forward to the appointment.', sentAt: new Date() },
  })

  await prisma.note.create({
    data: { contactId: maria.id, inquiryId: mariaInquiry.id, title: 'Initial note', body: 'Prospect interested in term life coverage and wants family protection options.', author: 'System' },
  })

  await prisma.contentAsset.create({
    data: { title: 'Appointment Reminder Email', type: 'email', status: 'draft', campaign: 'Spring Follow-Up', bodyText: 'Just a quick reminder about your upcoming consultation.' },
  })

  await prisma.calendarEvent.create({
    data: { contactId: john.id, inquiryId: johnInquiry.id, provider: 'manual', title: 'Consultation Call', startAt: new Date(Date.now() + 3 * 86400000), status: 'scheduled' },
  })

  await prisma.systemEvent.createMany({
    data: [
      { type: 'seed.contact.created', contactId: maria.id, inquiryId: mariaInquiry.id, payload: { demo: true } },
      { type: 'seed.contact.created', contactId: john.id, inquiryId: johnInquiry.id, payload: { demo: true } },
    ],
  })
}

main().finally(async () => {
  await prisma.$disconnect()
})

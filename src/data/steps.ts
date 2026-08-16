export interface Step {
  id: string
  title: string
  description: string
}

export const steps: Step[] = [
  {
    id: '01',
    title: 'Share your numbers',
    description:
      'Two minutes online, or send it on WhatsApp. No documents at this stage.',
  },
  {
    id: '02',
    title: 'We shortlist banks',
    description:
      "We know each bank's policy — income cut-offs, employer lists, score bands. We only apply where you fit.",
  },
  {
    id: '03',
    title: 'Compare the offers',
    description:
      'Rate, processing fee, prepayment terms — laid side by side so the cheapest one is obvious.',
  },
  {
    id: '04',
    title: 'Documents to disbursal',
    description:
      'Your advisor chases the branch, the verification call and the sanction letter until money is credited.',
  },
]

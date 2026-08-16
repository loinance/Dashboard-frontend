export interface Testimonial {
  id: string
  quote: string
  name: string
  product: string
  /** Portrait URL once available; falls back to the hatched placeholder. */
  avatar?: string
}

export const testimonials: Testimonial[] = [
  {
    id: 'priyabartha',
    quote:
      'The process was so smooth. Got my home loan approved in days — highly recommended.',
    name: 'Priyabartha Das',
    product: 'Home loan',
  },
  {
    id: 'ankur',
    quote:
      'Best rates and great support. I got offers from multiple banks and chose the best one.',
    name: 'Ankur Kumar Singh',
    product: 'Personal loan',
  },
  {
    id: 'raghavan',
    quote:
      'No hidden fees and very transparent. The team helped me at every step.',
    name: 'R Raghavan',
    product: 'Business loan',
  },
]

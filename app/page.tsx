import { Metadata } from 'next';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { MobileNav } from '@/components/MobileNav';
import { Hero } from '@/components/sections/Hero';
import { Services } from '@/components/sections/Services';
import { FeaturedProjects } from '@/components/sections/FeaturedProjects';
import { Testimonials } from '@/components/sections/Testimonials';
import { CTA } from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'CICCL | Professional Quantity Surveyor, Project Manager & Construction Manager',
  description: 'Expert quantity surveying services for construction projects. Cost planning, budget management, and contract administration by certified professional in Nigeria.',
  keywords: ['Quantity Surveyor', 'Cost Planning', 'Project Control', 'Budget Management', 'Nigeria', 'Construction Management', 'Contract Administration'],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: 'https://ciccl.vercel.app',
    title: 'CICCL | Professional Quantity Surveyor, Project Manager & Construction Manager',
    description: 'Expert quantity surveying services for construction projects. Cost planning, budget management, and contract administration.',
    siteName: 'CICCL Quantity Surveyors',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CICCL | Professional Quantity Surveyor',
    description: 'Expert quantity surveying services for construction projects in Nigeria.',
  },
  alternates: {
    canonical: 'https://ciccl.vercel.app',
  },
};

export default function Home() {
  return (
    <main className="w-full">
      <Navbar />
      <Hero />
      <Services />
      <FeaturedProjects />
      <Testimonials />
      <CTA />
      <Footer />
      <MobileNav />
    </main>
  );
}

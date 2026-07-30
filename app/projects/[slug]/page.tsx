import { Metadata } from 'next';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import ProjectDetailClient from './ProjectDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  
  // Try to find project with exact slug first
  let project = await Project.findOne({ slug, isPublished: true }).lean() as any;
  
  // If not found, try with decoded slug (for URLs with special characters)
  if (!project) {
    try {
      const decodedSlug = decodeURIComponent(slug);
      project = await Project.findOne({ slug: decodedSlug, isPublished: true }).lean() as any;
    } catch (e) {
      // If decoding fails, continue with original slug
    }
  }
  
  // If still not found, try removing special characters like commas (slugify removes them)
  if (!project) {
    const cleanedSlug = slug.replace(/,/g, '').replace(/'/g, '').replace(/[^\w-]/g, '');
    project = await Project.findOne({ slug: cleanedSlug, isPublished: true }).lean() as any;
  }
  
  // If still not found, try case-insensitive search
  if (!project) {
    project = await Project.findOne({ 
      slug: { $regex: new RegExp(`^${slug}$`, 'i') },
      isPublished: true 
    }).lean() as any;
  }
  
  // If still not found, try fuzzy matching
  if (!project) {
    const fuzzySlug = slug.replace(/[^a-z0-9-]/gi, '');
    project = await Project.findOne({ 
      slug: { $regex: new RegExp(fuzzySlug.replace(/-/g, '[-\\s]+'), 'i') },
      isPublished: true 
    }).lean() as any;
  }
  
  if (!project) {
    return {
      title: 'Project Not Found | CICCL',
      description: 'The requested project could not be found.',
    };
  }

  const title = `${project.title} | CICCL`;
  const description = project.shortSummary || project.description?.slice(0, 160) || 'Professional quantity surveying and project management services.';
  const images = project.images || [];
  const coverImage = project.coverImage || images[0];

  return {
    title,
    description,
    keywords: [
      'Quantity Surveyor',
      'Cost Planning',
      'Project Management',
      'Construction',
      project.projectType,
      ...(project.hashtags || []),
    ].filter(Boolean) as string[],
    openGraph: {
      type: 'article',
      locale: 'en_NG',
      url: `https://ciccl.vercel.app/projects/${project.slug}`,
      title,
      description,
      siteName: 'CICCL Quantity Surveyors',
      images: coverImage ? [
        {
          url: coverImage,
          width: 1200,
          height: 630,
          alt: project.title,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: coverImage ? [coverImage] : undefined,
    },
    alternates: {
      canonical: `https://ciccl.vercel.app/projects/${project.slug}`,
    },
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  await connectDB();
  
  console.log('Looking for project with slug:', slug);
  
  // Try to find project with exact slug first
  let project = await Project.findOne({ slug, isPublished: true }).lean() as any;
  console.log('Exact match found:', !!project);
  
  // If not found, try with decoded slug (for URLs with special characters)
  if (!project) {
    try {
      const decodedSlug = decodeURIComponent(slug);
      console.log('Trying decoded slug:', decodedSlug);
      project = await Project.findOne({ slug: decodedSlug, isPublished: true }).lean() as any;
      console.log('Decoded match found:', !!project);
    } catch (e) {
      console.log('Decode failed:', e);
    }
  }
  
  // If still not found, try removing special characters like commas (slugify removes them)
  if (!project) {
    const cleanedSlug = slug.replace(/,/g, '').replace(/'/g, '').replace(/[^\w-]/g, '');
    console.log('Trying cleaned slug:', cleanedSlug);
    project = await Project.findOne({ slug: cleanedSlug, isPublished: true }).lean() as any;
    console.log('Cleaned match found:', !!project);
  }
  
  // If still not found, try case-insensitive search
  if (!project) {
    console.log('Trying case-insensitive search');
    project = await Project.findOne({ 
      slug: { $regex: new RegExp(`^${slug}$`, 'i') },
      isPublished: true 
    }).lean() as any;
    console.log('Case-insensitive match found:', !!project);
  }
  
  // If still not found, try fuzzy matching with special character removal
  if (!project) {
    const fuzzySlug = slug.replace(/[^a-z0-9-]/gi, '');
    console.log('Trying fuzzy slug:', fuzzySlug);
    project = await Project.findOne({ 
      slug: { $regex: new RegExp(fuzzySlug.replace(/-/g, '[-\\s]+'), 'i') },
      isPublished: true 
    }).lean() as any;
    console.log('Fuzzy match found:', !!project);
  }
  
  if (!project) {
    console.log('Project not found for slug:', slug);
    return (
      <main className="w-full bg-background">
        <div className="w-full max-w-full pt-28 pb-20 px-4">
          <div className="text-center text-muted-foreground">Project not found</div>
        </div>
      </main>
    );
  }

  console.log('Project found:', project.title);
  return <ProjectDetailClient project={JSON.parse(JSON.stringify(project))} />;
}
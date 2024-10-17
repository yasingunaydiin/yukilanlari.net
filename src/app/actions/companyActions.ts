'use server';
import { connectToDB } from '@/lib/dbConnect'; // Import the database connection
import { CompanyModel } from '@/models/Company';
import { WorkOS } from '@workos-inc/node';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const workos = new WorkOS(process.env.WORKOS_API_KEY);

export async function createCompany(
  companyName: string,
  newCompanyContactName: string,
  newCompanyPhone: string,
  newCompanyEmail: string,
  newCompanyLocation: string,
  newCompanyWebsite: string,
  newCompanySocialFacebook: string,
  userId: string
) {
  // Connect to MongoDB
  await connectToDB();

  // Create the organization in WorkOS
  const org = await workos.organizations.createOrganization({
    name: companyName,
  });

  // Create a membership for the user in the organization
  await workos.userManagement.createOrganizationMembership({
    userId,
    organizationId: org.id,
    roleSlug: 'admin',
  });

  // Create a new company document in MongoDB
  const newCompany = new CompanyModel({
    newCompanyContactName: newCompanyContactName,
    newCompanyPhone: newCompanyPhone,
    newCompanyEmail: newCompanyEmail,
    newCompanyLocation: newCompanyLocation,
    newCompanyWebsite: newCompanyWebsite,
    newCompanySocialFacebook: newCompanySocialFacebook,
    organizationId: org.id, // Save the WorkOS organization ID
    createdBy: userId, // Store the authenticated user ID
  });

  // Save the company details to MongoDB
  await newCompany.save();

  // Revalidate the path and redirect the user
  revalidatePath('/new-listing');
  redirect('/new-listing');
}

//deleted chauffeur here
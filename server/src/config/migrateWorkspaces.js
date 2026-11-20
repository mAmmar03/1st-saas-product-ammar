import Workspace from '../models/Workspace.js';
import User from '../models/User.js';
import BrandProfile from '../models/BrandProfile.js';
import Influencer from '../models/Influencer.js';
import Article from '../models/Article.js';
import Deal from '../models/Deal.js';
import PRBudget from '../models/PRBudget.js';

export const ensureWorkspaceIsolation = async () => {
  try {
    // 1. Find or create default workspace for legacy/seed data
    let defaultWorkspace = await Workspace.findOne();
    const superAdmin = await User.findOne({ role: 'super_admin' });

    if (!defaultWorkspace && superAdmin) {
      defaultWorkspace = await Workspace.create({
        name: 'Stylish Collection Workspace',
        slug: 'stylish-collection',
        owner: superAdmin._id,
        status: 'active',
      });
      console.log('[Multi-Tenancy] Created default workspace:', defaultWorkspace._id);
    }

    if (defaultWorkspace) {
      const defId = defaultWorkspace._id;

      // Ensure superadmin has workspaceId and is email verified
      if (superAdmin && (!superAdmin.workspaceId || !superAdmin.isEmailVerified)) {
        superAdmin.workspaceId = defId;
        superAdmin.isEmailVerified = true;
        await superAdmin.save();
        console.log('[Multi-Tenancy] Linked Super Admin to default workspace.');
      }

      // Link any orphaned users
      const usersRes = await User.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId, isEmailVerified: true } }
      );
      if (usersRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${usersRes.modifiedCount} legacy users to default workspace.`);
      }

      // Link BrandProfile
      const bpRes = await BrandProfile.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId } }
      );
      if (bpRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${bpRes.modifiedCount} brand profiles to default workspace.`);
      }

      // Link Influencers
      const infRes = await Influencer.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId } }
      );
      if (infRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${infRes.modifiedCount} influencers to default workspace.`);
      }

      // Link Articles
      const artRes = await Article.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId } }
      );
      if (artRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${artRes.modifiedCount} articles to default workspace.`);
      }

      // Link Deals
      const dealRes = await Deal.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId } }
      );
      if (dealRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${dealRes.modifiedCount} deals to default workspace.`);
      }

      // Link Budgets
      const budRes = await PRBudget.updateMany(
        { workspaceId: { $in: [null, undefined] } },
        { $set: { workspaceId: defId } }
      );
      if (budRes.modifiedCount > 0) {
        console.log(`[Multi-Tenancy] Migrated ${budRes.modifiedCount} budgets to default workspace.`);
      }
    }
  } catch (err) {
    console.error('[Multi-Tenancy Migration Error]:', err);
  }
};

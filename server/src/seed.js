import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from './models/Article.js';
import Influencer from './models/Influencer.js';
import Deal from './models/Deal.js';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ammardev_crm');
    console.log('[Seed] Connected to database');

    // Clear existing data
    await Article.deleteMany({});
    await Influencer.deleteMany({});
    await Deal.deleteMany({});

    // 1. Create Sample Articles with PR Quotas
    const art1 = await Article.create({
      name: 'Summer Floral Lawn 3-Piece - Ocean Blue',
      articleCode: 'LNW-101',
      category: 'Unstitched Luxury',
      totalPRQuota: 30,
      sentPieces: 2,
      remainingPieces: 28,
      unitCost: 4500,
      notes: 'Featured in digital catalog volume 1',
    });

    const art2 = await Article.create({
      name: 'Embroidered Velvet Pret Kurti - Maroon',
      articleCode: 'VLV-202',
      category: 'Pret Ready to Wear',
      totalPRQuota: 20,
      sentPieces: 1,
      remainingPieces: 19,
      unitCost: 6500,
      notes: 'Winter capsule collection piece',
    });

    // 2. Create Sample Influencers
    const inf1 = await Influencer.create({
      name: 'Alizeh Khan',
      instagramHandle: '@alizeh_glam',
      followers: 85000,
      phone: '0301-4455667',
      email: 'alizeh@creatorhub.pk',
      city: 'Lahore',
      shippingAddress: 'House 14-B, Street 3, Sector Y, DHA Phase 3, Lahore',
      niche: 'Fashion & Beauty',
      tier: 'Mid-Tier',
      bankDetails: {
        bankName: 'Meezan Bank Ltd',
        accountTitle: 'Alizeh Khan',
        accountNumber: '02010109988776',
        iban: 'PK12MEZN0002010109988776',
      },
      rating: 5,
      notes: 'Very professional, high story engagement and punctual with delivery.',
    });

    const inf2 = await Influencer.create({
      name: 'Fatima Noor',
      instagramHandle: '@fatimastyle_official',
      followers: 42000,
      phone: '0321-9988112',
      email: 'fatima.pr@gmail.com',
      city: 'Karachi',
      shippingAddress: 'Flat 402, Al-Razi Heights, Block 13, Gulshan-e-Iqbal, Karachi',
      niche: 'Lifestyle & Modest Fashion',
      tier: 'Micro',
      bankDetails: {
        bankName: 'Bank Alfalah',
        accountTitle: 'Fatima Noor',
        accountNumber: '550198273645',
        iban: 'PK44ALFH00550198273645',
      },
      rating: 4,
      notes: 'Great aesthetic reel videos.',
    });

    // 3. Create Sample Deals
    const deal1 = await Deal.create({
      influencer: inf1._id,
      campaignName: 'Summer Launch Volume 1',
      agreedDate: new Date('2026-11-10'),
      agreedRate: 40000,
      ratePerVideo: 40000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: art1._id,
          quantity: 2,
          dispatchStatus: 'Dispatched',
          dispatchDate: new Date('2026-11-12'),
          courierName: 'TCS Courier',
          trackingNumber: '7749102834',
          deliveryNotes: 'Delivered to Lahore DHA residence',
        },
      ],
      videos: [
        {
          videoType: 'Reel',
          scheduledDate: new Date('2026-11-20'),
          status: 'Draft Received',
          liveUrl: '',
          notes: 'Try-on styling reel with brand tag',
        },
      ],
      payment: {
        totalAmount: 40000,
        advancePaid: 20000,
        remainingAmount: 20000,
        status: 'Advance Paid',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date('2026-11-10'),
      },
      pastDealNotes: 'Advance 50% paid upon brief confirmation.',
    });

    const deal2 = await Deal.create({
      influencer: inf2._id,
      campaignName: 'Winter Velvet Drop',
      agreedDate: new Date('2026-11-14'),
      agreedRate: 25000,
      ratePerVideo: 25000,
      dealStatus: 'Agreed',
      prArticles: [
        {
          article: art2._id,
          quantity: 1,
          dispatchStatus: 'Dispatched',
          dispatchDate: new Date('2026-11-15'),
          courierName: 'Leopard Courier',
          trackingNumber: 'LEO-9928172',
          deliveryNotes: 'Shipped to Karachi',
        },
      ],
      videos: [
        {
          videoType: 'Reel',
          scheduledDate: new Date('2026-11-24'),
          status: 'Pending',
          liveUrl: '',
          notes: 'Unboxing & styling',
        },
      ],
      payment: {
        totalAmount: 25000,
        advancePaid: 0,
        remainingAmount: 25000,
        status: 'Unpaid',
        paymentMethod: 'Bank Transfer',
      },
      pastDealNotes: 'Full payment upon post live link submission.',
    });

    console.log('[Seed] Sample data populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();

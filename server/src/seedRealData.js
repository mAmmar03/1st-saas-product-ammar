import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Article from './models/Article.js';
import Influencer from './models/Influencer.js';
import Deal from './models/Deal.js';

dotenv.config();

const seedRealNotes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ammardev_crm');
    console.log('[SeedRealData] Connected to DB');

    // Wipe previous collections
    await Article.deleteMany({});
    await Influencer.deleteMany({});
    await Deal.deleteMany({});

    // 1. Create Articles from Image 1
    const artPistachio = await Article.create({
      name: 'Pistachio Kaftan 2pc',
      articleCode: 'PK-2PC',
      category: 'Kaftan',
      totalPRQuota: 6,
      sentPieces: 3, // Hoor, Fatima Shafiq, Mahnoor Khan
      remainingPieces: 3,
      unitCost: 3500,
      notes: 'PR Quota from notes: 6 pcs total',
    });

    const artChocolate = await Article.create({
      name: 'Black Chocolate 3pc',
      articleCode: 'BC-3PC',
      category: 'Luxury Pret',
      totalPRQuota: 6,
      sentPieces: 5, // Hoor, Faiqa, Fatima, Aimen, Mahnoor
      remainingPieces: 1,
      unitCost: 4500,
      notes: 'PR Quota from notes: 6 pcs total',
    });

    const artSunshine = await Article.create({
      name: 'Sunshine 3pc',
      articleCode: 'SS-3PC',
      category: 'Summer 3pc',
      totalPRQuota: 3,
      sentPieces: 2, // Faiqa, Aimen
      remainingPieces: 1,
      unitCost: 4000,
      notes: 'PR Quota from notes: 3 pcs total',
    });

    const artHoor = await Article.create({
      name: 'Hoor 2pc',
      articleCode: 'HR-2PC',
      category: 'Pret 2pc',
      totalPRQuota: 5,
      sentPieces: 0,
      remainingPieces: 5,
      unitCost: 3200,
      notes: 'PR Quota from notes: 5 pcs total',
    });

    // 2. Create Influencers from Image 3 & 4
    const infFaiqa = await Influencer.create({
      name: 'Faiqa Waseem',
      primaryPlatform: 'Instagram',
      instagramHandle: '@Faiqawaseem30',
      phone: '0308 0636093',
      city: 'Hafizabad',
      shippingAddress: 'Muhalla garhi awan gali molvi yehya wali hafizabad',
      preferredSize: 'Large',
      niche: 'Fashion & Lifestyle',
      tier: 'Micro',
      notes: 'Price as per previous 7k per reel',
    });

    const infHoor = await Influencer.create({
      name: 'Hoor',
      primaryPlatform: 'Instagram',
      instagramHandle: '@Hoor_blogs',
      phone: '0308 2647946',
      city: 'Karachi',
      shippingAddress: 'Nazimabad no 2 block 2j6/1 near charo qoo chowrangi karachi',
      preferredSize: 'Small',
      niche: 'Lifestyle Blogger',
      tier: 'Micro',
      notes: 'Price as per previous 6k per reel',
    });

    const infFatima = await Influencer.create({
      name: 'Fatima Shafiq',
      primaryPlatform: 'Instagram',
      instagramHandle: '@blurry--face',
      phone: '0309-4744585',
      city: 'Bahawalpur',
      shippingAddress: 'House no 422/R near Punjnad flour mill badal sher Bahawalpur',
      preferredSize: 'Medium',
      niche: 'Modest Fashion & Reviews',
      tier: 'Micro',
      notes: 'PR Package Program: Story unboxing, highlights, reel collab, story promotion. 5k per reel',
    });

    const infAimen = await Influencer.create({
      name: 'Aimen',
      primaryPlatform: 'Instagram',
      instagramHandle: '@chicwithaimen',
      phone: '0304 1778089',
      city: 'Bahawalpur',
      shippingAddress: '108/B, street 6, Hashmi Garden, Bahawalpur',
      preferredSize: 'Small',
      niche: 'Chic Style & Fashion',
      tier: 'Micro',
      notes: '4k per reel',
    });

    const infMahnoor = await Influencer.create({
      name: 'Mahnoor Khan',
      primaryPlatform: 'Instagram',
      instagramHandle: '@Fitsbynur',
      phone: '',
      city: 'Lahore',
      shippingAddress: 'Lahore delivery address',
      preferredSize: 'Medium',
      niche: 'Fashion Outfits',
      tier: 'Micro',
      notes: '5k per reel, 2 dresses total 10k',
    });

    // 3. Create Deals from Image 3 & 4
    // Deal 1: Faiqa Waseem (SP# 17778)
    await Deal.create({
      spNumber: 'SP# 17778',
      influencer: infFaiqa._id,
      campaignName: 'Winter Kaftan Collab',
      agreedRate: 14000,
      ratePerVideo: 7000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: artChocolate._id,
          quantity: 1,
          size: 'Large',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 17778',
          dispatchDate: new Date(),
        },
        {
          article: artSunshine._id,
          quantity: 1,
          size: 'Large',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 17778',
          dispatchDate: new Date(),
        },
      ],
      videos: [
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 4 * 86400000),
          status: 'Draft Received',
          notes: 'Reel 1 - Black Chocolate styling',
        },
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 8 * 86400000),
          status: 'Pending',
          notes: 'Reel 2 - Sunshine styling',
        },
      ],
      pastDealNotes: '2 Dresses, 7k per reel, Total 14k',
    });

    // Deal 2: Hoor (SP# 17787)
    await Deal.create({
      spNumber: 'SP# 17787',
      influencer: infHoor._id,
      campaignName: 'Kaftan Collection',
      agreedRate: 12000,
      ratePerVideo: 6000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: artPistachio._id,
          quantity: 1,
          size: 'Small',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 17787',
          dispatchDate: new Date(),
        },
        {
          article: artChocolate._id,
          quantity: 1,
          size: 'Small',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 17787',
          dispatchDate: new Date(),
        },
      ],
      videos: [
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 5 * 86400000),
          status: 'Pending',
          notes: '6k per reel, 2 dresses',
        },
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 9 * 86400000),
          status: 'Pending',
          notes: '6k per reel',
        },
      ],
      pastDealNotes: '2 Dresses, Total 12k, 6k per reel',
    });

    // Deal 3: Fatima Shafiq (SP# 18352)
    await Deal.create({
      spNumber: 'SP# 18352',
      influencer: infFatima._id,
      campaignName: 'PR Package Program',
      agreedRate: 10000,
      ratePerVideo: 5000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: artPistachio._id,
          quantity: 1,
          size: 'Medium',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18352',
          dispatchDate: new Date(),
        },
        {
          article: artChocolate._id,
          quantity: 1,
          size: 'Medium',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18352',
          dispatchDate: new Date(),
        },
      ],
      videos: [
        {
          videoType: 'Story Unboxing',
          scheduledDate: new Date(Date.now() + 3 * 86400000),
          status: 'Pending',
          notes: 'Unboxing parcel upon arrival',
        },
        {
          videoType: 'Highlights',
          scheduledDate: new Date(Date.now() + 5 * 86400000),
          status: 'Pending',
          notes: 'Add to Instagram Highlights',
        },
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 7 * 86400000),
          status: 'Pending',
          notes: 'Main Reel collab (5k)',
        },
        {
          videoType: 'Story Promotion',
          scheduledDate: new Date(Date.now() + 10 * 86400000),
          status: 'Pending',
          notes: 'Story promotion with swipe-up/link',
        },
      ],
      pastDealNotes: 'PR Package Program: 2 dresses, 5k per reel, Total 10k',
    });

    // Deal 4: Aimen (SP# 18365)
    await Deal.create({
      spNumber: 'SP# 18365',
      influencer: infAimen._id,
      campaignName: 'Winter Drops',
      agreedRate: 8000,
      ratePerVideo: 4000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: artSunshine._id,
          quantity: 1,
          size: 'Small',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18365',
          dispatchDate: new Date(),
        },
        {
          article: artChocolate._id,
          quantity: 1,
          size: 'Small',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18365',
          dispatchDate: new Date(),
        },
      ],
      videos: [
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 6 * 86400000),
          status: 'Pending',
          notes: '4k per reel, 2 dresses',
        },
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 11 * 86400000),
          status: 'Pending',
          notes: 'Reel 2',
        },
      ],
      pastDealNotes: '2 Dresses, 4k charge, Total 8k',
    });

    // Deal 5: Mahnoor Khan (SP# 18385)
    await Deal.create({
      spNumber: 'SP# 18385',
      influencer: infMahnoor._id,
      campaignName: 'Kaftan Launch',
      agreedRate: 10000,
      ratePerVideo: 5000,
      dealStatus: 'In Progress',
      prArticles: [
        {
          article: artPistachio._id,
          quantity: 1,
          size: 'Medium',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18385',
          dispatchDate: new Date(),
        },
        {
          article: artChocolate._id,
          quantity: 1,
          size: 'Medium',
          dispatchStatus: 'Dispatched',
          courierName: 'TCS Courier',
          trackingNumber: 'SP# 18385',
          dispatchDate: new Date(),
        },
      ],
      videos: [
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 7 * 86400000),
          status: 'Pending',
          notes: '5k per reel, 2 dresses',
        },
        {
          videoType: 'Reel Collaboration',
          scheduledDate: new Date(Date.now() + 12 * 86400000),
          status: 'Pending',
          notes: 'Reel 2',
        },
      ],
      pastDealNotes: '2 Dresses, 5k per reel, Total 10k',
    });

    console.log('[SeedRealData] Populated successfully from user notes!');
    process.exit(0);
  } catch (err) {
    console.error('[SeedRealData Error]:', err);
    process.exit(1);
  }
};

seedRealNotes();

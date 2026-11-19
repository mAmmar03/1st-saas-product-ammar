import PRBudget from '../models/PRBudget.js';
import Deal from '../models/Deal.js';

// Helper: Get ISO Week Number
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  return { year: d.getUTCFullYear(), week: weekNo };
}

// Helper: Get Week Date Range
function getWeekRange(date = new Date()) {
  const d = new Date(date);
  const day = d.getDay();
  const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
  const start = new Date(d.setDate(diffToMonday));
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

// 1. Get Budget Overview (Monthly & Weekly + Overrun status + Deals list)
export const getBudgetOverview = async (req, res) => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = String(now.getMonth() + 1).padStart(2, '0');
    const currentMonthKey = `${currentYear}-${currentMonthNum}`;

    const { year: wYear, week: wNum } = getWeekNumber(now);
    const currentWeekKey = `${wYear}-W${String(wNum).padStart(2, '0')}`;

    // Month start & end
    const monthStart = new Date(currentYear, now.getMonth(), 1, 0, 0, 0, 0);
    const monthEnd = new Date(currentYear, now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Week start & end
    const { start: weekStart, end: weekEnd } = getWeekRange(now);

    // Fetch all deals
    const allDeals = await Deal.find()
      .populate('influencer', 'name instagramHandle profileImage')
      .populate('prArticles.article', 'name category prPrice')
      .sort({ agreedDate: -1 });

    // Calculate Month Spend
    let monthCommittedSpend = 0;
    let monthPaidCount = 0;
    let monthBarterCount = 0;
    const monthDeals = [];

    // Calculate Week Spend
    let weekCommittedSpend = 0;
    let weekPaidCount = 0;
    let weekBarterCount = 0;
    const weekDeals = [];

    allDeals.forEach((deal) => {
      const dealDate = new Date(deal.agreedDate || deal.createdAt);

      // Check month
      if (dealDate >= monthStart && dealDate <= monthEnd) {
        monthDeals.push(deal);
        if (deal.dealType === 'Barter PR') {
          monthBarterCount++;
        } else {
          monthPaidCount++;
          monthCommittedSpend += deal.agreedRate || 0;
        }
      }

      // Check week
      if (dealDate >= weekStart && dealDate <= weekEnd) {
        weekDeals.push(deal);
        if (deal.dealType === 'Barter PR') {
          weekBarterCount++;
        } else {
          weekPaidCount++;
          weekCommittedSpend += deal.agreedRate || 0;
        }
      }
    });

    // Fetch stored budget records
    let monthlyBudgetDoc = await PRBudget.findOne({ periodKey: currentMonthKey });
    let weeklyBudgetDoc = await PRBudget.findOne({ periodKey: currentWeekKey });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ];
    const defaultMonthLabel = `${monthNames[now.getMonth()]} ${currentYear}`;
    const defaultWeekLabel = `Week ${wNum} (${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${wYear})`;

    const monthAllocated = monthlyBudgetDoc ? monthlyBudgetDoc.allocatedBudget : 0;
    const weekAllocated = weeklyBudgetDoc ? weeklyBudgetDoc.allocatedBudget : 0;

    const monthOverrun = monthAllocated > 0 && monthCommittedSpend > monthAllocated;
    const monthOverrunAmount = monthOverrun ? monthCommittedSpend - monthAllocated : 0;
    const monthRemaining = Math.max(0, monthAllocated - monthCommittedSpend);
    const monthUtilization = monthAllocated > 0 ? Math.round((monthCommittedSpend / monthAllocated) * 100) : 0;

    const weekOverrun = weekAllocated > 0 && weekCommittedSpend > weekAllocated;
    const weekOverrunAmount = weekOverrun ? weekCommittedSpend - weekAllocated : 0;
    const weekRemaining = Math.max(0, weekAllocated - weekCommittedSpend);
    const weekUtilization = weekAllocated > 0 ? Math.round((weekCommittedSpend / weekAllocated) * 100) : 0;

    // Fetch recent budgets history
    const history = await PRBudget.find().sort({ createdAt: -1 }).limit(12);

    res.json({
      monthly: {
        periodKey: currentMonthKey,
        periodLabel: monthlyBudgetDoc?.periodLabel || defaultMonthLabel,
        allocatedBudget: monthAllocated,
        committedSpend: monthCommittedSpend,
        remainingBudget: monthRemaining,
        isOverrun: monthOverrun,
        overrunAmount: monthOverrunAmount,
        utilizationPercent: monthUtilization,
        paidDealsCount: monthPaidCount,
        barterDealsCount: monthBarterCount,
        notes: monthlyBudgetDoc?.notes || '',
        updatedAt: monthlyBudgetDoc?.updatedAt || null,
        updatedBy: monthlyBudgetDoc?.updatedBy || 'Not configured',
        deals: monthDeals,
      },
      weekly: {
        periodKey: currentWeekKey,
        periodLabel: weeklyBudgetDoc?.periodLabel || defaultWeekLabel,
        allocatedBudget: weekAllocated,
        committedSpend: weekCommittedSpend,
        remainingBudget: weekRemaining,
        isOverrun: weekOverrun,
        overrunAmount: weekOverrunAmount,
        utilizationPercent: weekUtilization,
        paidDealsCount: weekPaidCount,
        barterDealsCount: weekBarterCount,
        notes: weeklyBudgetDoc?.notes || '',
        updatedAt: weeklyBudgetDoc?.updatedAt || null,
        updatedBy: weeklyBudgetDoc?.updatedBy || 'Not configured',
        deals: weekDeals,
      },
      history,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch budget overview: ' + error.message });
  }
};

// 2. Set or Update Budget (Super Admin Only)
export const setBudget = async (req, res) => {
  try {
    const { periodType, periodKey, periodLabel, allocatedBudget, notes } = req.body;

    if (!periodKey || allocatedBudget === undefined) {
      return res.status(400).json({ error: 'periodKey and allocatedBudget are required.' });
    }

    const budgetNum = Number(allocatedBudget);
    if (isNaN(budgetNum) || budgetNum < 0) {
      return res.status(400).json({ error: 'allocatedBudget must be a non-negative number.' });
    }

    const updatedBy = req.user?.name || 'Super Admin (Ammar)';

    const budget = await PRBudget.findOneAndUpdate(
      { periodKey },
      {
        periodType: periodType || (periodKey.includes('W') ? 'weekly' : 'monthly'),
        periodKey,
        periodLabel: periodLabel || periodKey,
        allocatedBudget: budgetNum,
        notes: notes || '',
        updatedBy,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: `PR Budget for ${budget.periodLabel || budget.periodKey} set to Rs. ${budgetNum.toLocaleString()}`,
      budget,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to set budget: ' + error.message });
  }
};

// 3. Delete Budget Allocation (Super Admin Only)
export const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    await PRBudget.findByIdAndDelete(id);
    res.json({ message: 'Budget target removed successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

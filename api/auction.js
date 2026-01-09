// api/auction.js
let auctionData = {
  bidders: {},
  currentBids: {
    1: { price: 500000, bidder: '等待中...', timestamp: Date.now() },
    2: { price: 350000, bidder: '等待中...', timestamp: Date.now() },
    3: { price: 650000, bidder: '等待中...', timestamp: Date.now() },
    4: { price: 400000, bidder: '等待中...', timestamp: Date.now() }
  },
  callingStages: { 1: 0, 2: 0, 3: 0, 4: 0 },
  callingTimers: { 1: 0, 2: 0, 3: 0, 4: 0 }
};

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json(auctionData);
  }

  if (req.method === 'POST') {
    const { action, data } = req.body;

    if (action === 'placeBid') {
      const { propertyId, bidAmount, bidderName, userId } = data;
      auctionData.currentBids[propertyId] = {
        price: bidAmount,
        bidder: bidderName,
        timestamp: Date.now(),
        userId: userId
      };
      auctionData.bidders[userId] = {
        name: bidderName,
        lastBid: bidAmount
      };

      if (auctionData.callingStages[propertyId] === 0) {
        auctionData.callingStages[propertyId] = 1;
        auctionData.callingTimers[propertyId] = 10;
      } else {
        auctionData.callingStages[propertyId] = 1;
        auctionData.callingTimers[propertyId] = 10;
      }

      return res.status(200).json({
        success: true,
        message: 'Bid placed successfully',
        data: auctionData
      });
    }

    if (action === 'updateCalling') {
      const { propertyId, stage, timer } = data;
      auctionData.callingStages[propertyId] = stage;
      auctionData.callingTimers[propertyId] = timer;

      return res.status(200).json({
        success: true,
        message: 'Calling updated',
        data: auctionData
      });
    }

    if (action === 'registerBidder') {
      const { userId, bidderName } = data;
      auctionData.bidders[userId] = {
        name: bidderName,
        lastBid: 0
      };

      return res.status(200).json({
        success: true,
        message: 'Bidder registered',
        data: auctionData
      });
    }

    if (action === 'endAuction') {
      const { propertyId, openingBid } = data;
      auctionData.currentBids[propertyId] = {
        price: openingBid,
        bidder: '等待中...',
        timestamp: Date.now()
      };
      auctionData.callingStages[propertyId] = 0;
      auctionData.callingTimers[propertyId] = 0;

      return res.status(200).json({
        success: true,
        message: 'Auction ended',
        data: auctionData
      });
    }
  }

  return res.status(400).json({ error: 'Invalid request' });
}

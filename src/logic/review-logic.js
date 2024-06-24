import ReviewModel from '../models/review-model.js';
import ErrorModel from '../models/error-model.js';

async function createReview(review) {
    const errors = review.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);
    return review.save();
}

async function updateReview(reviewId, reviewData) {
    const updatedReview = await ReviewModel.findByIdAndUpdate(reviewId, reviewData, { new: true, runValidators: true }).exec();
    if (!updatedReview) throw new ErrorModel(404, `Review with id ${reviewId} not found`);
    return updatedReview;
}

async function deleteReview(reviewId) {
    const deletedReview = await ReviewModel.findByIdAndDelete(reviewId).exec();
    if (!deletedReview) throw new ErrorModel(404, `Review with id  ${reviewId} not found`);
    return deletedReview;
}

async function getAllReviews() {
    return ReviewModel.find()
    .populate({
        path: 'vacationId',
        populate: [
            { path: 'companyName', model: 'CompanyModel' },
            { path: 'tripCategory', model: 'CategoryModel' }
        ]
    })
    .populate('userId')
    .exec();
}
async function getReviewById(reviewId) {
    return ReviewModel.findById(reviewId)
    .populate({
        path: 'vacationId',
        populate: [
            { path: 'companyName', model: 'CompanyModel' },
            { path: 'tripCategory', model: 'CategoryModel' }
        ]
    })
    .populate('userId')
    .exec();
}

export default {
    createReview,
    updateReview,
    deleteReview,
    getAllReviews,
    getReviewById,
};

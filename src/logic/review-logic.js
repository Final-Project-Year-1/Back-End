import ReviewModel from '../models/review-model.js';
import ErrorModel from '../models/error-model.js';
import VacationModel from '../models/vacation-model.js'
import UserModel from '../models/user-model.js';
import vacationLogic from '../logic/vacation-logic.js';

async function createReview(review) {
    const errors = review.validateSync(); 
    if (errors) {
        throw new ErrorModel(400, errors.message);
    }
    const savedReview = await review.save();

    await vacationLogic.updateVacationRating(review.vacationId);
    await vacationLogic.updateGeneralVacationFields(review.vacationId);
    return savedReview;
}

async function updateReview(reviewId, reviewData) {
    const updatedReview = await ReviewModel.findByIdAndUpdate(reviewId, reviewData, { new: true, runValidators: true }).exec();
    if (!updatedReview) {
        throw new ErrorModel(404, `Review with id ${reviewId} not found`);
    }
    await vacationLogic.updateVacationRating(updatedReview.vacationId);
    await vacationLogic.updateGeneralVacationFields(updatedReview.vacationId);
    return updatedReview;
}
async function deleteReview(reviewId) {
    const deletedReview = await ReviewModel.findByIdAndDelete(reviewId).exec();
    if (!deletedReview) throw new ErrorModel(404, `Review with id  ${reviewId} not found`);
    await vacationLogic.updateVacationRating(deletedReview.vacationId);

    await vacationLogic.updateGeneralVacationFields(deletedReview.vacationId);

    return deletedReview;
}

//Do we need this? Yes we need!
async function getAllReviews() {
    return ReviewModel.find()
    .populate({
        path: 'vacationId',
        populate: [
            { path: 'companyName', model: 'CompanyModel'},
            { path: 'tripCategory', model: 'CategoryModel' }
        ]
    })
    .populate('userId')
    .exec();
}
async function getReviewsByUserId(userId) {
    return ReviewModel.find({ userId })
        .populate({
            path: 'userId',
            select: 'firstName lastName email'
        })
        .exec();
}
async function getReviewByVacationId(vacationId) {
    return ReviewModel.find({ vacationId })
    .populate({
        path: 'userId',
        select: 'firstName lastName email'
    })
    .exec();
}

export default {
    createReview,
    updateReview,
    deleteReview,
    getAllReviews,
    getReviewByVacationId,
    getReviewsByUserId,
};

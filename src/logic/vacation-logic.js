import ErrorModel from "../models/error-model.js";
import VacationModel from "../models/vacation-model.js";
import CompanyModel from "../models/company-model.js";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import ReviewModel from "../models/review-model.js";
import bookingLogic from "../logic/booking-logic.js"

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CANCELLED_VACATION_ID = "000000000000000000000000";
const CANCELLED_VACATION_IMAGE = "logo-vacationHub.png";


async function getAllVacations() {
    return VacationModel.find({ destination: { $ne: "Cancelled" } })
        .populate("companyName")
        .populate("tripCategory")
        .exec();
}

async function getOneVacation(_id) {
    const vacation = await VacationModel.findById(_id)
        .populate("companyName")
        .populate("tripCategory")
        .exec();
    if (!vacation) throw new ErrorModel(404, `_id ${_id} not found`);
    return vacation;
}

async function createVacation(vacation) {
    if (vacation.spotsTaken !== undefined) {
        vacation.spotsLeft = vacation.groupOf - vacation.spotsTaken;
    }

    if (vacation.image) {
        const extension = vacation.image.name.substring(vacation.image.name.lastIndexOf("."));
        vacation.imageName = uuid() + extension;
        await vacation.image.mv(path.join(__dirname, "..", "assets", "images", "vacations", vacation.imageName));
        delete vacation.image;
    }

    const errors = vacation.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    return vacation.save();
}

async function updateGeneralVacationFields(vacationId) {
    try {
        console.log(`Updating general fields for vacation ${vacationId}`);
        const vacation = await VacationModel.findById(vacationId);
        if (!vacation) throw new ErrorModel(404, `Vacation with id ${vacationId} not found`);

        await vacation.save();
        console.log(`General fields for vacation ${vacationId} updated`);

        return vacation;
    } catch (err) {
        console.error("Error in updateGeneralVacationFields:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function updateVacation(vacation) {
    const errors = vacation.validateSync();
    if (errors) throw new ErrorModel(400, errors.message);

    if (vacation.image) {
        const extension = vacation.image.name.substring(vacation.image.name.lastIndexOf("."));
        vacation.imageName = uuid() + extension;
        await vacation.image.mv(path.join(__dirname, "..", "assets", "images", "vacations", vacation.imageName));
        delete vacation.image;
    }
    
    const updatedVacation = await VacationModel.findByIdAndUpdate(vacation._id, vacation, { returnOriginal: false }).exec();
    if (!updatedVacation) throw new ErrorModel(404, `Vacation with _id ${vacation._id} not found`);

    return updatedVacation;
}
// */async function updateVacation(vacation) {
//     // Retrieve the current state of the vacation from the database
//     const currentVacation = await VacationModel.findById(vacation._id);
//     if (!currentVacation) throw new ErrorModel(404, `Vacation with _id ${vacation._id} not found`);

//     // Validate vacation details
//     const errors = vacation.validateSync();
//     if (errors) throw new ErrorModel(400, errors.message);

//     // Handle image update if there's a new image
//     if (vacation.image) {
//         const extension = vacation.image.name.substring(vacation.image.name.lastIndexOf("."));
//         vacation.imageName = uuid() + extension;
//         await vacation.image.mv(path.join(__dirname, "..", "assets", "images", "vacations", vacation.imageName));
//         delete vacation.image;  // Remove the image object since it's now stored and path is updated
//     }

//     // Calculate the change in spots taken if any
//     if (vacation.spotsTaken !== undefined && vacation.spotsTaken !== currentVacation.spotsTaken) {
//         const spotsDifference = vacation.spotsTaken - currentVacation.spotsTaken;
//         currentVacation.spotsTaken = vacation.spotsTaken;
//         currentVacation.spotsLeft = currentVacation.groupOf - currentVacation.spotsTaken;

//         // Check for overbooking
//         if (currentVacation.spotsLeft < 0) {
//             throw new ErrorModel(400, 'Overbooking error: more spots taken than available in the group.');
//         }
//     }

//     // Update the vacation with the new details
//     const updatedVacation = await VacationModel.findByIdAndUpdate(vacation._id, currentVacation, { new: true }).exec();
//     if (!updatedVacation) throw new ErrorModel(404, `Failed to update vacation with _id ${vacation._id}`);

//     return updatedVacation;
// }

async function deleteVacation(_id) {
    // יצירת חופשה מבוטלת אם היא לא קיימת
    await createCancelledVacation();

    // מחיקת חופשה
    const deletedVacation = await VacationModel.findByIdAndDelete(_id).exec();
    if (!deletedVacation) throw new ErrorModel(404, `Vacation with _id ${_id} not found`);

    // קבלת כל ההזמנות עם איידי של החופשה
    const bookings = await bookingLogic.getBookingByVacationId(_id);

    // שינוי הסטטוס של כל הזמנה ל-"cancelled" ועדכון איידי של החופשה לחופשה מבוטלת
    for (const booking of bookings) {
        booking.status = "cancelled";
        booking.vacationId = CANCELLED_VACATION_ID;  // שינוי איידי לחופשה מבוטלת
        await booking.save();
    }

    return deletedVacation;
}
async function createCancelledVacation() {
    const existingVacation = await VacationModel.findById(CANCELLED_VACATION_ID).exec();
    if (existingVacation) return existingVacation;

    const cancelledVacation = new VacationModel({
        _id: CANCELLED_VACATION_ID,
        destination: "Cancelled",
        description: "This vacation represents cancelled bookings.",
        startDate: new Date(),
        endDate: new Date(),
        price: 0,
        groupOf: 1,
        vacationType: "Deleted",
        companyName: "66a6181bdf91811f95d24e27",  
        tripCategory: "66a3ca690aca3398927a017c",  
        imageName: CANCELLED_VACATION_IMAGE
    });

    await cancelledVacation.save();
    return cancelledVacation;
}
async function getTotalVacations() {
    try {
        const totalVacations = await VacationModel.countDocuments({});
        return { totalVacations: totalVacations - 1 };
    } catch (err) {
        console.error("Error in getTotalVacations:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getTotalVacationsByCompany(companyId) {
    try {
        const company = await CompanyModel.findById(companyId);
        if (!company) {
            throw new ErrorModel(404, `Company with id ${companyId} not found`);
        }

        const vacations = await VacationModel.find({ companyName: companyId }, '_id');

        const detailedVacations = await Promise.all(vacations.map(async (vacation) => {
            const detailedVacation = await getOneVacation(vacation._id);
            return {
                vacationId: detailedVacation._id,
                vacationName: detailedVacation.name,
                vacationDescription: detailedVacation.description,
                vacationDestnation: detailedVacation.destination,
            };
        }));

        const totalVacations = vacations.length;
        return { companyId: company._id, companyName: company.company, totalVacations, vacations: detailedVacations };
    } catch (err) {
        console.error("Error in getTotalVacationsByCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function getTopVacations() {
    try {
        const vacationsByCompany = await getVacationsByCompany();
        const maxVacations = Math.max(...vacationsByCompany.map(company => company.totalVacations));
        const topCompanies = vacationsByCompany.filter(company => company.totalVacations === maxVacations);

        if (!topCompanies.length) {
            throw new ErrorModel(404, "No companies found");
        }

        return topCompanies;
    } catch (err) {
        console.error("Error in getTopCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function getVacationsByCompany() {
    try {
        const result = await CompanyModel.aggregate([
            {
                $lookup: {
                    from: 'vacations',
                    localField: '_id',
                    foreignField: 'companyName',
                    as: 'vacations'
                }
            },
            {
                $addFields: {
                    totalVacations: { $size: "$vacations" }
                }
            },
            {
                $project: {
                    _id: 0,
                    companyId: "$_id",
                    totalVacations: 1,
                    company: "$company"
                }
            },
            {
                $sort: { totalVacations: -1 }
            }
        ]);

        if (!result || result.length === 0) {
            throw new ErrorModel(404, "No companies found");
        }

        return result;
    } catch (err) {
        console.error("Error in getVacationsByCompany:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function updateVacationSpots(vacationId, passengers) {
    try {
        const vacation = await VacationModel.findById(vacationId);
        if (!vacation) throw new ErrorModel(404, `Vacation with id ${vacationId} not found`);
        
        const totalSpotsTaken = vacation.spotsTaken + passengers;
        if(totalSpotsTaken > vacation.groupOf){
            throw new ErrorModel(err.status || 500, err.message || "Invalid Number")
        }
        vacation.spotsTaken = totalSpotsTaken;
        vacation.spotsLeft = vacation.groupOf - vacation.spotsTaken
        await vacation.save();

        return vacation;
    } catch (err) {
        console.error("Error in updateVacationSpots:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function getTopRatedVacations(limit = 4) {
    try {

        const topVacations = await VacationModel.find().sort({ rating: -1 }).limit(limit).exec();
        
        if (topVacations.length < limit) {
            return await VacationModel.find()
                .sort({ rating: -1 })
                .populate("companyName", "company") 
                .populate("tripCategory", "category") 
                .exec();
        }
        const lowestTopRating = topVacations[topVacations.length - 1].rating;
        const additionalVacations = await VacationModel.find({ rating: lowestTopRating }).exec();

        const allTopVacationsIds = [...new Set([...topVacations.map(v => v._id.toString()), ...additionalVacations.map(v => v._id.toString())])];
        const allTopVacations = await VacationModel.find({ _id: { $in: allTopVacationsIds } })
            .sort({ rating: -1 })
            .populate("companyName", "company") 
            .populate("tripCategory", "category") 
            .exec();

        return allTopVacations;
    } catch (err) {
        console.error("Error in getTopRatedVacations:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function updateVacationRating(vacationId) {
    try {
        console.log(`Updating rating for vacation ${vacationId}`);
        const reviews = await ReviewModel.find({ vacationId }).exec();
        if (reviews.length === 0) throw new ErrorModel(404, `No reviews found for vacation with id ${vacationId}`);
        
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = totalRating / reviews.length;

        const roundedAverageRating = Number(averageRating.toFixed(2));

        const vacation = await VacationModel.findByIdAndUpdate(vacationId, { rating: roundedAverageRating }, { new: true }).exec();
        if (!vacation) throw new ErrorModel(404, `Vacation with id ${vacationId} not found`);


        return vacation;
    } catch (err) {
        console.error("Error in updateVacationRating:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function searchQuery(numOfPassengers, departureMonth, destination) {
    if (!numOfPassengers || !departureMonth || !destination) {
        throw new ErrorModel(400, 'All parameters are required: numOfPassengers, departureMonth, destination');
    }

    try {
        const passengers = parseInt(numOfPassengers, 10);
        if (isNaN(passengers)) {
            throw new ErrorModel(400, 'numOfPassengers must be a number');
        }

        const vacations = await VacationModel.find().populate("companyName").populate("tripCategory").exec();


            const filteredVacations = vacations.filter(vacation => {
                const startMonth = vacation.startDate ? new Date(vacation.startDate).getMonth() + 1 : null;
                const matches = vacation.destination === destination &&
                                startMonth === parseInt(departureMonth, 10) &&
                                passengers <= vacation.spotsLeft;

                return matches;
        });

        if (!filteredVacations || filteredVacations.length === 0) {
            throw new ErrorModel(404, "No vacations found with the given criteria");
        }

        return filteredVacations;
    } catch (err) {
        console.error("Error in searchQuery:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function searchVacationsByCriteria(companyId, minRating, numOfPassengers, departureMonth) {
    if (!numOfPassengers || !companyId || !minRating) {
        throw new ErrorModel(400, 'All parameters are required: companyId, minRating, numOfPassengers');
    }

    try {
        const passengers = parseInt(numOfPassengers, 10);
        const rating = parseFloat(minRating);

        if (isNaN(passengers)) {
            throw new ErrorModel(400, 'numOfPassengers must be a number');
        }
        if (isNaN(rating)) {
            throw new ErrorModel(400, 'minRating must be a number');
        }

        const vacations = await VacationModel.find().populate("companyName").populate("tripCategory").exec();

        console.log("All vacations found:", vacations);

        const filteredVacations = vacations.filter(vacation => {
            const startMonth = vacation.startDate ? new Date(vacation.startDate).getMonth() + 1 : null;
            const matches = vacation.companyName._id.toString() === companyId &&
                            vacation.rating >= rating &&
                            passengers <= vacation.spotsLeft;

            if (departureMonth) {
                return matches && startMonth === parseInt(departureMonth, 10);
            }
            return matches;
        });

        if (!filteredVacations || filteredVacations.length === 0) {
            throw new ErrorModel(404, "No vacations found with the given criteria");
        }

        return filteredVacations;
    } catch (err) {
        console.error("Error in searchVacationsByCriteria:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}

async function getAllDestinations() {
    try {
        const vacations = await getAllVacations();
        const destinations = [...new Set(vacations.map(vacation => vacation.destination))];
        const destinationCount = destinations.length;
    
        return { destinations, destinationCount };
    } catch (err) {
        console.error("Error in getAllDestinations:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
async function getAllVacationImages() {
    try {
        const vacations = await VacationModel.find({}, 'imageName').exec();
        const imageNames = vacations.map(vacation => vacation.imageName).filter(imageName => !!imageName); // סינון שמות תמונות לא חוקיים

        return {
            imageNames: imageNames,
            totalImages: imageNames.length
        };
    } catch (err) {
        console.error("Error in getAllVacationImages:", err);
        throw new ErrorModel(err.status || 500, err.message || "Internal server error");
    }
}
export default {
    getAllVacations,
    getOneVacation,
    createVacation,
    getVacationsByCompany,
    updateVacation,
    deleteVacation,
    getTotalVacations,
    getTopVacations,
    getTotalVacationsByCompany,
    searchQuery,
    updateVacationSpots,
    getTopRatedVacations,
    updateVacationRating,
    updateGeneralVacationFields,
    searchVacationsByCriteria,
    getAllDestinations,
    getAllVacationImages,
};

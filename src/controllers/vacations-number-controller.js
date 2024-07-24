// import express from 'express';
// import logic from '../logic/vacations-number-logic.js'; 
// import ErrorModel from '../models/error-model.js';

// const router = express.Router();

// //Do we need this?
// // router.get('/top-vacations', async (req, res) => {
// //     try {
// //         const result = await logic.getTopCompany();
// //         res.json(result);
// //     } catch (err) {
// //         if (err instanceof ErrorModel) {
// //             res.status(err.status).json({ error: err.message });
// //         } else {
// //             res.status(500).json({ error: "Internal server error" });
// //         }
// //     }
// // });

// //Do need this:
// router.get('/vacations-by-company', async (req, res) => {
//     try {
//         const result = await logic.getVacationsByCompany();
//         res.json(result);
//     } catch (err) {
//         if (err instanceof ErrorModel) {
//             res.status(err.status).json({ error: err.message });
//         } else {
//             res.status(500).json({ error: "Internal server error" });
//         }
//     }
// });



// export default router;

import { Router } from "express";
import multer from "multer";
import { env } from "../config/env";
import { authMiddleware } from "../middleware/auth.middleware";
import { studentController } from "../controllers/student.controller";
import { HttpError } from "../utils/http-error";
import { asyncHandler } from "../utils/async-handler";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.MAX_UPLOAD_SIZE,
  },
  fileFilter: (_request, file, callback) => {
    const filename = file.originalname.toLowerCase();
    const isCsv =
      file.mimetype === "text/csv" ||
      file.mimetype === "application/vnd.ms-excel" ||
      filename.endsWith(".csv");

    const isExcel =
      file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.mimetype === "application/wps-office.xlsx" ||
      filename.endsWith(".xlsx");

    if (!isCsv && !isExcel) {
      callback(new HttpError(400, "Only CSV (.csv) and Excel (.xlsx) files are allowed"));
      return;
    }

    callback(null, true);
  },
});

export const studentRoutes = Router();

studentRoutes.post(
  "/slug/:slug/students/validate",
  asyncHandler(studentController.validateStudent.bind(studentController))
);

studentRoutes.use("/:id/students", authMiddleware);

studentRoutes.post(
  "/:id/students",
  asyncHandler(studentController.addStudents.bind(studentController))
);
studentRoutes.get(
  "/:id/students",
  asyncHandler(studentController.listStudents.bind(studentController))
);
studentRoutes.post(
  "/:id/students/import/csv",
  upload.single("file"),
  asyncHandler(studentController.importCsv.bind(studentController))
);
studentRoutes.post(
  "/:id/students/import/excel",
  upload.single("file"),
  asyncHandler(studentController.importExcel.bind(studentController))
);
studentRoutes.post(
  "/:id/students/import/xlsx",
  upload.single("file"),
  asyncHandler(studentController.importExcel.bind(studentController))
);

studentRoutes.delete(
  "/:id/students/:studentId",
  asyncHandler(studentController.removeStudent.bind(studentController))
);
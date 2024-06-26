import express, {Router} from 'express';
import {
  addLectureToCourseById,
  createCourse,
  deleteLectureToCourseById,
  getAllCourses,
  getLecturesByCourseId,
  removeCourse,
  updateCourse,
  likeLectureVideo,
  dislikeLectureVideo,
  commentLectureVideo,
  replyCommentLectureVideo
} from '../Controllers/Course.Controllers.js';
import {authorizeRoles, isLoggedIn} from '../Middlewares/jwtAuth.js';
import {upload} from '../Middlewares/multer.middleware.js';

const router = Router ();

router
  .route ('/')
  .get (getAllCourses)
  .post (
    isLoggedIn,
    authorizeRoles("ADMIN"),
    upload.fields ([{name: 'thumbnail', maxCount: 1}]),
    createCourse
  );

router
  .route ('/:id')
  .get (isLoggedIn, getLecturesByCourseId)
  .post (isLoggedIn,  authorizeRoles("ADMIN"), upload.fields ([{name: 'lecture', maxCount: 1}]), addLectureToCourseById)
  .put (isLoggedIn, authorizeRoles('ADMIN'), updateCourse)
  .delete (isLoggedIn,  authorizeRoles('ADMIN') ,removeCourse);

  router.route('/lecture/:courseId/:lectureId')
  .delete(isLoggedIn,authorizeRoles("ADMIN"),deleteLectureToCourseById)

  router.route('/lecture/:courseId/:lectureId').post(isLoggedIn,likeLectureVideo);

  router.route('/lecture/dislike/:courseId/:lectureId').post(isLoggedIn,dislikeLectureVideo);

  router.route('/lecture/comment/:courseId/:lectureId').post(isLoggedIn,commentLectureVideo);

  router.route('/lecture/comment/reply/:courseId/:lectureId/:commentId').post(isLoggedIn,replyCommentLectureVideo);

  export default router;


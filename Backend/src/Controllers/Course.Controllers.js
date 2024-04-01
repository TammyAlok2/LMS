import { Course } from "../Models/Course.Models.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { asyncHandler } from "../Utils/AsyncHandler.js";
import { uploadOnCloudaniry, uploadVideoOnCloudinary } from "../Utils/Cloudinary.js";

// can be accessed by public
const getAllCourses = asyncHandler(async (req, res, next) => {
  // find all the courses from Database without lectures
  const courses = await Course.find({}).select("-lectures");

  if (!courses) {
    throw new ApiError(400, "Something went wrong");
  }

  return res.status(200).json(new ApiResponse(201, courses, "All Courses"));
});

const getLecturesByCourseId = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(400, "Course not find ");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        201,
        course.lectures,
        "Course lectures fetched successfully "
      )
    );
});

const likeLectureVideo = asyncHandler(async(req,res,next)=>{
// first get the lecture Id and validate it 

const {courseId,lectureId} = req.params;


const course = await Course.findById(courseId);

const lectureIndex = course.lectures.findIndex(lecture => lecture._id == lectureId);

if (lectureIndex === -1) {
    throw new ApiError(400, "Lecture ID does not exist in the course");
}

//checking if already liked or not
// Check if the user has already liked the lecture video
if (course.lectures[lectureIndex].likes.some(like => like && like.userId.toString() === req.user.id.toString())) {
  throw new ApiError(400, "You have already liked this lecture video");
} 
  // Add the user ID to the likes array of the lecture
  course.lectures[lectureIndex].likes.push({ userId: req.user.id });


  // Save the updated course
  await course.save();

  // Return the updated course lectures
  res.status(200).json(
      new ApiResponse(
          200,
          course.lectures,
          "Lecture video liked successfully"
      )
  );
})

const dislikeLectureVideo = asyncHandler(async(req,res)=>{
  // taking 
  
})
const createCourse = asyncHandler(async (req, res, next) => {
  // taking the data from fronted and validation
  // taking new thumbnail from files  and upload on cloudinary
  // making new course
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    new ApiError(400, "All fields are required ");
  }
  const localThumbnailFile = req.files?.thumbnail[0].path;

  if (!localThumbnailFile) {
    new ApiError(400, "Thumbnail is required ");
  }

  const Thumbnail = await uploadOnCloudaniry(localThumbnailFile);
  console.log(Thumbnail);
  if (!Thumbnail) {
    new ApiError(400, "Thumbnail upload failed ");
  }

  const course = await Course.create({
    title,
    description,
    category,
    createdBy,
    thumbnail: {
      public_id: Thumbnail.public_id,
      secure_url: Thumbnail.secure_url
    }
  });

  if (!course) {
    return new ApiError(400, "Course could not be created , please try again");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, course, "Course created successfully "));
});

const updateCourse = asyncHandler(async (req,res,next) => {
  // first take the id of course   and gives us data
  const { id } = req.params;

  const course = await Course.findByIdAndUpdate(
    id,
    {
      $set: req.body
    },
    {
      runValidators: true
    }
  );
  if(!course){
    throw new ApiError(400,'Course with given id does not exists')
  }

  return res.status(200).json(
    new ApiResponse(201,course,'Course update successfully')
  )
});

const removeCourse = asyncHandler(async (req,res,next)=>{
    // first take the id from req.param and use findByIdAndDelete method 

    const {id} = req.params;
    const course = await Course.findById(id);

    if(!course){
        throw new ApiError(400,'Course with given id does not exists')
    }

   await Course.findByIdAndDelete(id);

   return res.status(200).json(
    new ApiResponse(201,course,'course remove  successfully')
   )

})

const addLectureToCourseById = asyncHandler(async (req, res, next) => {

  // take the title, description  , lecuture video from fronted
  // taking the course id from params
  // finding the course from the databse
  // uploading the video to the cloudinary and
  // making the array to store public id and secure url and then push
  const { title, description } = req.body;
  console.log(title,description)
  const { id } = req.params;
  const lectureData = {};

  if (!title || !description) {
    throw new ApiError(400, "Title and descriptin are mandatory");
  }

  const course = await Course.findById(id);
  if (!course) {
    throw new ApiError(400, "Invalid course id or course not found ");
  }
  const videoLecture = req.files?.lecture[0].path;
  console.log(videoLecture)
  if(!videoLecture){
    throw new ApiError(400, "Lecture video not defined");
  }

  if (videoLecture) {
    let uploadedVideo = await uploadVideoOnCloudinary(videoLecture);
    console.log(uploadedVideo);

    if (!uploadedVideo) {
      throw new ApiError(400, "video upload failed ");
    }

    lectureData.public_id = uploadedVideo.public_id;
    lectureData.secure_url = uploadedVideo.secure_url;
  }

  course.lectures.push({
    title,
    description,
    lecture: lectureData
  });
  course.numberOfLectures = course.lectures.length;

  // sace the course object

  await course.save();

  return res
    .status(200)
    .json(new ApiResponse(201, course, "Lecture added successfully "));
});

const deleteLectureToCourseById = asyncHandler(async (req,res,next)=>{

// taking user id from req.params and validate it 
// taking the lecture id and find the index and then slice it
const {courseId,lectureId} = req.params;

const course = await Course.findById(courseId);


if(!course){
   throw new ApiError(400,"Course does not exists");
}

// Find index of the lecture with given id in the course's lectures array
const lectureIndex = course.lectures.findIndex(lecture => lecture._id == lectureId);

if (lectureIndex === -1) {
    throw new ApiError(400, "Lecture ID does not exist in the course");
}

// Remove the lecture from the course's lectures array
course.lectures.splice(lectureIndex, 1);
await course.save()




return res.status(200).json(
    new ApiResponse(201,course,"Lecture deleted successfully")
)

})


export {
  getAllCourses,
  getLecturesByCourseId,
  createCourse,
  addLectureToCourseById,
  deleteLectureToCourseById,
  updateCourse,
  removeCourse,
  likeLectureVideo
};

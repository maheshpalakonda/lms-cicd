import { uploadFileToS3, deleteFileFromS3 } from "../configs/awsS3.js";
import { v4 as uuidv4 } from 'uuid';
import Course from "../models/courseModel.js"
import Lecture from "../models/lectureModel.js"
import User from "../models/userModel.js"

// create Courses
export const createCourse = async (req,res) => {

    try {
        const {title,category} = req.body
        if(!title || !category){
            return res.status(400).json({message:"title and category is required"})
        }
        const course = await Course.create({
            title,
            category,
            creator: req.userId
        })
        
        return res.status(201).json(course)
    } catch (error) {
         return res.status(500).json({message:`Failed to create course ${error}`})
    }
    
}

export const getPublishedCourses = async (req,res) => {
    try {
        const courses = await Course.find({isPublished:true}).populate("lectures reviews")
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }

        return res.status(200).json(courses)
        
    } catch (error) {
          return res.status(500).json({message:`Failed to get All  courses ${error}`})
    }
}


export const getCreatorCourses = async (req,res) => {
    try {
        const userId = req.userId
        const courses = await Course.find({creator:userId})
        if(!courses)
        {
            return res.status(404).json({message:"Course not found"})
        }
        return res.status(200).json(courses)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get creator courses ${error}`})
    }
}

export const editCourse = async (req,res) => {
    try {
        const {courseId} = req.params;
        const {title , subTitle , description , category , level , price , isPublished } = req.body;
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        let thumbnail
         if(req.file){
            if (course.thumbnail) { // Check if course.thumbnail exists before accessing
                const oldKey = course.thumbnail.split('/').pop();
                await deleteFileFromS3(oldKey);
            }
            const key = `thumbnails/${uuidv4()}-${req.file.originalname}`;
            thumbnail = await uploadFileToS3(req.file.path, key);
        }
        const updateData = {title , subTitle , description , category , level , price , isPublished ,thumbnail}

        course = await Course.findByIdAndUpdate(courseId , updateData , {new:true})
        return res.status(201).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to update course ${error}`})
    }
}


export const getCourseById = async (req,res) => {
    try {
        const {courseId} = req.params
        let course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
         return res.status(200).json(course)
        
    } catch (error) {
        return res.status(500).json({message:`Failed to get course ${error}`})
    }
}
export const removeCourse = async (req, res) => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    await course.deleteOne();
    return res.status(200).json({ message: "Course Removed Successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({message:`Failed to remove course ${error}`})
  }
};



//create lecture

export const createLecture = async (req,res) => {
    try {
        const {lectureTitle}= req.body
        const {courseId} = req.params

        if(!lectureTitle || !courseId){
             return res.status(400).json({message:"Lecture Title required"})
        }
        const lecture = await Lecture.create({lectureTitle})
        const course = await Course.findById(courseId)
        if(course){
            course.lectures.push(lecture._id)
            
        }
        await course.populate("lectures")
        await course.save()
        return res.status(201).json({lecture,course})
        
    } catch (error) {
        return res.status(500).json({message:`Failed to Create Lecture ${error}`})
    }
    
}

export const getCourseLecture = async (req,res) => {
    try {
        const {courseId} = req.params
        const course = await Course.findById(courseId)
        if(!course){
            return res.status(404).json({message:"Course not found"})
        }
        await course.populate("lectures")
        await course.save()
        return res.status(200).json(course)
    } catch (error) {
        return res.status(500).json({message:`Failed to get Lectures ${error}`})
    }
}

export const editLecture = async (req,res) => {
    try {
        console.log(`[DEBUG] editLecture called with lectureId=${req.params.lectureId}, body=${JSON.stringify(req.body)}, file=${req.file ? req.file.originalname : 'none'}`);
        const {lectureId} = req.params
        const {isPreviewFree , lectureTitle} = req.body
        console.log(`[DEBUG] Finding lecture by id=${lectureId}`);
        const lecture = await Lecture.findById(lectureId)
          if(!lecture){
            console.log(`[DEBUG] Lecture not found for id=${lectureId}`);
            return res.status(404).json({message:"Lecture not found"})
        }
        console.log(`[DEBUG] Lecture found: ${JSON.stringify(lecture)}`);
        let videoUrl
        if(req.file){
            console.log(`[DEBUG] File present: originalname=${req.file.originalname}, path=${req.file.path}`);
            if (lecture.videoUrl) {
                const oldKey = lecture.videoUrl.split('/').pop();
                console.log(`[DEBUG] Deleting old video from S3: key=${oldKey}`);
                await deleteFileFromS3(oldKey);
            }
            const key = `lectures/${uuidv4()}-${req.file.originalname}`;
            console.log(`[DEBUG] Uploading new video with key=${key}`);
            videoUrl = await uploadFileToS3(req.file.path, key);
            console.log(`[DEBUG] Upload result: videoUrl=${videoUrl}`);
            if (videoUrl) {
                lecture.videoUrl = videoUrl;
                console.log(`[DEBUG] Set lecture.videoUrl to ${videoUrl}`);
            } else {
                console.error(`[DEBUG] Upload failed, videoUrl is null`);
                return res.status(500).json({message:"Failed to upload video to S3"});
            }
        } else {
            console.log(`[DEBUG] No file uploaded, skipping S3 operations`);
        }
        if(lectureTitle){
            console.log(`[DEBUG] Updating lectureTitle to ${lectureTitle}`);
            lecture.lectureTitle = lectureTitle
        }
        console.log(`[DEBUG] Setting isPreviewFree to ${isPreviewFree}`);
        lecture.isPreviewFree = isPreviewFree

        console.log(`[DEBUG] Saving lecture`);
        console.log(`[DEBUG] Lecture before save: videoUrl=${lecture.videoUrl}`);
        try {
            const savedLecture = await lecture.save()
            console.log(`[DEBUG] Lecture saved successfully: ${JSON.stringify(savedLecture)}`);
            console.log(`[DEBUG] videoUrl in saved lecture: ${savedLecture.videoUrl}`);

            // Double check by fetching from DB
            const fetchedLecture = await Lecture.findById(savedLecture._id);
            console.log(`[DEBUG] Fetched lecture videoUrl: ${fetchedLecture.videoUrl}`);

            // If fetch shows no videoUrl, try direct update
            if (!fetchedLecture.videoUrl && lecture.videoUrl) {
                console.log(`[DEBUG] videoUrl not persisted, trying direct update`);
                const updateResult = await Lecture.findByIdAndUpdate(
                    savedLecture._id,
                    { videoUrl: lecture.videoUrl },
                    { new: true }
                );
                console.log(`[DEBUG] Direct update result: ${JSON.stringify(updateResult)}`);
                return res.status(200).json(updateResult);
            }

            return res.status(200).json(savedLecture)
        } catch (saveError) {
            console.error(`[DEBUG] Error saving lecture: ${saveError}`);
            return res.status(500).json({message:`Failed to save lecture: ${saveError}`})
        }
    } catch (error) {
        console.error(`[DEBUG] Error in editLecture: ${error}`);
        return res.status(500).json({message:`Failed to edit Lectures ${error}`})
    }

}

export const removeLecture = async (req,res) => {
    try {
        const {lectureId} = req.params
        const lecture = await Lecture.findByIdAndDelete(lectureId)
        if(!lecture){
             return res.status(404).json({message:"Lecture not found"})
        }
        //remove the lecture from associated course

        await Course.updateOne(
            {lectures: lectureId},
            {$pull:{lectures: lectureId}}
        )
        return res.status(200).json({message:"Lecture Remove Successfully"})
        }
    
     catch (error) {
        return res.status(500).json({message:`Failed to remove Lectures ${error}`})
    }
}



//get Creator data


// controllers/userController.js

export const getCreatorById = async (req, res) => {
  try {
    const {userId} = req.body;

    const user = await User.findById(userId).select("-password"); // Exclude password

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json( user );
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "get Creator error" });
  }
};





import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema({
    lectureTitle:{
        type:String,
        required:true
    },
    videoUrl:{
        type:String
    },
    isPreviewFree:{
        type:Boolean
    },
    isLive: {
        type: Boolean,
        default: false
    },
    liveStartTime: {
        type: Date
    },
    liveRoomId: {
        type: String
    },
    violations: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        violationType: {
            type: String,
            enum: ['screenshot', 'screen_recording', 'copy', 'print', 'dev_tools']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        ipAddress: {
            type: String
        }
    }]
},{timestamps:true})


const Lecture = mongoose.model("Lecture" , lectureSchema)

export default Lecture
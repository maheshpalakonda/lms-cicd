import React, { useState, useEffect } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../redux/userSlice';
import { serverUrl } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';
const CourseCard = ({ thumbnail, title, category, price ,id , reviews }) => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { userData, wishlist } = useSelector(state => state.user)
  const [isInWishlist, setIsInWishlist] = useState(false)

  const calculateAverageRating = (reviews) => {
    if (!reviews || reviews.length === 0) return 0;
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  const avgRating = calculateAverageRating(reviews);

  useEffect(() => {
    if (userData && userData.role === "student") {
      setIsInWishlist(wishlist.includes(id))
    }
  }, [wishlist, id, userData])

  const handleWishlistClick = async (e) => {
    e.stopPropagation()
    if (!userData || userData.role !== "student") {
      toast.error("Only students can use wishlist")
      return
    }
    try {
      if (isInWishlist) {
        await axios.post(serverUrl + "/api/user/removefromwishlist", { courseId: id }, { withCredentials: true })
        dispatch(removeFromWishlist(id))
        toast.success("Removed from wishlist")
      } else {
        await axios.post(serverUrl + "/api/user/addtowishlist", { courseId: id }, { withCredentials: true })
        dispatch(addToWishlist(id))
        toast.success("Added to wishlist")
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Wishlist update failed")
    }
  }
  return (
    <div className="max-w-sm w-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-300 relative" onClick={()=>navigate(`/viewcourse/${id}`)}>
      {/* Thumbnail */}
      <img
        src={thumbnail}
        alt={title}
        className="w-full h-48 object-cover"
      />
      {userData && userData.role === "student" && (
        <div className="absolute top-2 right-2" onClick={handleWishlistClick}>
          {isInWishlist ? <FaHeart className="w-6 h-6 text-red-500 cursor-pointer" /> : <FaRegHeart className="w-6 h-6 text-gray-500 cursor-pointer" />}
        </div>
      )}

      {/* Content */}
      <div className="p-5 space-y-2">
        {/* Title */}
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>

        {/* Category */}
        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-gray-700 capitalize">
            {category}
          </span>
        

        {/* Meta info */}
        <div className="flex justify-between text-sm text-gray-600 mt-3 px-[10px]">
          
          <span className="font-semibold text-gray-800">₹{price}</span>
         
           <span className="flex items-center gap-1 ">
            <FaStar className="text-yellow-500" /> {avgRating}
          </span>
          
        </div>
      </div>
    </div>
  );
};

export default CourseCard;

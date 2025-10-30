import React from 'react'
import home from "../assets/home.jpg"
import Nav from '../components/Nav'
import { SiViaplay } from "react-icons/si";
import Logos from '../components/Logos';
import Cardspage from '../components/Cardspage';
import ExploreCourses from '../components/ExploreCourses';
import About from '../components/About';
import ai from '../assets/ai.png'
import ai1 from '../assets/SearchAi.png'
import ReviewPage from '../components/ReviewPage';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
function Home() {
      const navigate = useNavigate()
      const {userData} = useSelector(state=>state.user)

  return (

    
    
    <div className='w-[100%] overflow-hidden'>
      
      <div className='w-[100%] lg:h-[140vh] h-[70vh] relative'>
        <Nav/>
        <img src={home} className='object-contain md:object-fill w-[100%] lg:h-[100%] h-[50vh]' alt="Home" href="/Home" />
        <div className='absolute inset-0 flex flex-col justify-start items-center pt-20 z-10'>
          <div className='text-center'>
            <span className='block lg:text-[60px] md:text-[45px] sm:text-[35px] text-[24px] text-black font-bold drop-shadow-2xl leading-tight'>
              Grow Your Skills to Advance
            </span>
            <span className='block lg:text-[60px] md:text-[45px] sm:text-[35px] text-[24px] text-black font-bold drop-shadow-2xl leading-tight mt-2'>
              Your Career Path
            </span>
          </div>
        </div>
      </div>
      <div className='flex items-center justify-center gap-6 flex-wrap px-4'>
        <button className='px-[32px] py-[18px] bg-white text-black border-2 border-black rounded-[12px] text-[20px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-100 transition-all duration-300 shadow-xl' onClick={()=>navigate("/allcourses")}>
          View All Courses <SiViaplay className='w-[24px] h-[24px] fill-black' />
        </button>
        {userData ? (
          <button className='px-[32px] py-[18px] bg-black text-white border-2 border-black rounded-[12px] text-[20px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-800 transition-all duration-300 shadow-xl' onClick={()=>navigate("/searchwithai")}>
            Search with AI <img src={ai} className='w-[24px] h-[24px] rounded-full hidden lg:block' alt="" /><img src={ai1} className='w-[26px] h-[26px] rounded-full lg:hidden' alt="" />
          </button>
        ) : (
          <button className='px-[32px] py-[18px] bg-black text-white border-2 border-black rounded-[12px] text-[20px] font-semibold flex gap-2 items-center cursor-pointer hover:bg-gray-800 transition-all duration-300 shadow-xl' onClick={()=>navigate("/login")}>
            Search with AI <img src={ai} className='w-[24px] h-[24px] rounded-full hidden lg:block' alt="" /><img src={ai1} className='w-[26px] h-[26px] rounded-full lg:hidden' alt="" />
          </button>
        )}
      </div>
      <Logos/>
      <ExploreCourses/>
      <Cardspage/>
      <About/>
      <ReviewPage/>
      <Footer/>

      
      
      
    </div>

  ) 
}

export default Home

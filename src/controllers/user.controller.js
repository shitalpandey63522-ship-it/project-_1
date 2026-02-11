import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
const generateAccessAndRefreshToken = async (userId) => {
  try { 
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
  console.error("Token generation error details:", error);
  throw new apiError(500, "Token generation failed, please try again");
}

};

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, email, username, password } = req.body;
  console.log("email: ", email);
  console.log(req.body);

  // validation - not empty
  if ([fullname, email, username, password].some((field) => field?.trim() === "")) {
    throw new apiError(400, "All fields are required");
  }

  // check if user already exists: username or email
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new apiError(409, "User with the same email or username already exists");
  }

  // check for images
  let coverImageLocalPath;
  if (req.files && req.files.coverImage?.length > 0) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }
  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new apiError(400, "Avatar file is required");
  }

  // upload them on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new apiError(400, "Avatar image upload failed");
  }

  // create user
  const newUser = await User.create({
    fullname,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(newUser._id).select("-password -refreshToken");

  if (!createdUser) {
    throw new apiError(500, "User creation failed, please try again");
  }

  return res.status(201).json(
    new ApiResponse(200, createdUser, "User registered successfully")
  );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new apiError(400, "Username or email is required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new apiError(404, "User not found");
  }

  // check password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new apiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(
      200,
      { user: loggedInUser, accessToken, refreshToken },
      "User logged in successfully"
    ));
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: undefined } },
    { new: true }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

if(!incomingRefreshToken){
  throw new apiError(401,"unauthorized request")
}
try {
  const decodedToken =jwt.verify(
  incomingRefreshToken,
    process.env.REFRESH_TOKEN_SECRET
  
  )
  
    const user =await User.findById(decodedToken?._id)
     if(!user){
      throw new apiError(401, "invalid  refresh token")
     }
  
     if(incomingRefreshToken!==user?.refreshToken){
      throw new apiError(401,"refresh token is expired or used")
     }
  
      const options={
        httpOnly:true,
        secure:true
  
      }
     const {accessToken,newRefreshToken}=await generateAccessAndRefreshToken(user._id)
  
  return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",accessToken,options)
    .json(
      new ApiResponse(
        200,
        {accessToken, refreshToken:newRefreshToken},
        "access token refreshed"
  
      )
    )
} catch (error) {
  throw new apiError(401,error?.message || "invalid refreshToken")
  
}
})

 const changeCurrentPassword=asyncHandler(async(req,res)=>{
    const{oldPassword,newPassword}=req.body
  const user=await User.findById(req.user?._id)
    const isPasswordCorrect  =  await user.isPasswordCorrect(oldpassword)

   if (!isPasswordCorrect){
    throw new apiError(400,"invalid password")
   }

   user.password=newPassword
  await user.save({validateBeforeSave:false})

  return res.status(200)
             .json(new ApiResponse(200,{},"password changed "))
 })

 const getCurrentUser= asyncHandler(async(req,res)=>{

return res.status(200)
          .json(200,req.user,"current User fetched Successfuly")

 })

const updateAccountDetails=asyncHandler(async(req,res)=>{
  const {fullname,email}=req.body

  if(!fullname || !email){
    throw new apiError(400,"all fileds are required")
  }
 const user= User.findByIdAndUpdate(req.user?._id,{
$set:{
  fullname,
  email
}




 },{
    new:true
  }).select("-password")

  return res
        .status(200)
        .json(new ApiResponse (200,"acount details updated"))

})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath= req.file?.path
    if(!avatarLocalPath){
      throw new apiError(400,"Avatar file is missing")
    }

    const avatar =await uploadOnCloudinary(avatarLocalPath)


    if(!avatarLocalPath.url){
      throw new apiError(400,"Error while uploading on avatar")}
     const user= await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
          avatar :avatar.url
        } },
        {new:true}
      ).select("-password")
        return res
      .status(200)
                 .json(
                  new ApiResponse(200,user,"avtar image Updated Successfully")
                 )



})

const updateUserCoverImage=asyncHandler(async(req,res)=>{
    const CoverImageLocalPath= req.file?.path
    if(!CoverImageLocalPath){
      throw new apiError(400,"coverImage file is missing")
    }

    const coverImage =await uploadOnCloudinary(CoverImageLocalPath)


    if(!coverImage.url){
      throw new apiError(400,"Error while uploading on covarImage")}
    const user=  await User.findByIdAndUpdate(
        req.user?._id,
        {$set:{
          coverImage :coverImage.url
        } },
        {new:true}
      ).select("-password")

      return res
      .status(200)
                 .json(
                  new ApiResponse(200,user,"coverImage Updated Successfully")
                 )



})



export { registerUser,
   loginUser,
   getCurrentUser,
   changeCurrentPassword,
   updateAccountDetails,
   logOutUser ,
   refreshAccessToken,
   updateUserAvatar,
   updateUserCoverImage};

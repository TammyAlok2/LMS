import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"
import { ApiError } from './ApiError.js';
          
cloudinary.config({ 
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME|| 'ds2lw90zo',
  api_key: process.env.CLOUDINARY_APISECRET ||965572779513459, 
  api_secret:  process.env.CLOUDINARY_APISECRET || 'yEGdlGTiBbM9x6uvSXvvlZFiLdc',
  
});


const uploadOnCloudaniry = async (localFilePath) =>{

try {
    if(!localFilePath) return null;
    // upload the file in cloudnary
const response =   await  cloudinary.uploader.upload(localFilePath , {
        resource_type:"auto",
        width:250,
        height :250,
        gravity : 'faces',
        crop:'fill'
    });
    // file has been uploaded successfully
    console.log('file uploaded on cloudnary',response.url);
    return response ;
    console.log(response)
} catch (error) {
    console.log(error)
    fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed 
    return null;
}


}

// first delete the exitisting file present in the databse 
const updateOnCloudinary = async (newFilePath, oldPublicId) => {
    try {
        if (!newFilePath || !oldPublicId) return null;

        // Delete the existing avatar using the old public id stored in the database
        const destroy = await cloudinary.uploader.destroy(oldPublicId);
        if (destroy.result !== 'ok') {
            throw new Error('Failed to delete old avatar');
        }
        console.log('Old avatar deleted successfully');

        // Upload the new image
        const response = await cloudinary.uploader.upload(newFilePath, {
            height: 250,
            gravity: 'faces',
            crop: 'fill'
        });
        console.log('File updated successfully', response.secure_url);
        
        return response  // Return the secure URL of the newly uploaded image
    } catch (error) {
        console.error(error);
        // Handle the error
        if (fs.existsSync(newFilePath)) {
            // Remove the locally saved temporary file as the upload operation failed 
            fs.unlinkSync(newFilePath);
        }
        return null;
    }
}

const uploadVideoOnCloudinary = async (localFilePath) =>{

    try {
        if(!localFilePath) return null;
        // upload the file in cloudnary
    const response =   await  cloudinary.uploader.upload(localFilePath , {
            resource_type:"video",
           
        });
        // file has been uploaded successfully
        console.log('file uploaded on cloudnary',response.url);
        return response ;
        console.log(response)
    } catch (error) {
        console.log(error)
        fs.unlinkSync(localFilePath) // remove the locally saved temporary file as the upload operation got failed 
        return null;
    }
    
    
    }


export {uploadOnCloudaniry,updateOnCloudinary,uploadVideoOnCloudinary}
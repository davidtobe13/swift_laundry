const itemModel = require("../models/itemsModel");
const cloudinary = require("../utils/cloudinary");

// exports.items = async(req, res)=>{
//     try {
//         const {item, Price} = req.body
//         const items = await itemModel.create({
//             item:item.toUpperCase(),
//             Price})

//         if (!items) {
//             res.status(500).json({
//                 error: "unable to create item"
//             })
//         } else {
//             return res.status(201).json({
//                 message: "item created successfully",
//                 data: items
//             })
//         }
//     } catch (error) {
//         res.status({
//             error: error.message
//         })
//     }
// }


exports.items = async (req, res) => {
    try {
        const { item, Price } = req.body;
        const imagee = req.file; // Assuming the image file is sent as part of form data

        // Upload image to Cloudinary
        const uploadedImage = await cloudinary.uploader.upload(imagee.path);

        // Create item with image URL
        const newItem = await itemModel.create({
            item: item.toUpperCase(),
            Price,
            imagee: uploadedImage.secure_url
        });

        if (!newItem) {
            return res.status(500).json({
                error: "Unable to create item"
            });
        }

        return res.status(201).json({
            message: "Item created successfully",
            data: newItem
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
};


exports.getOneItem = async(res, req)=>{
    try {
        const id = req.params.id
        const item = await itemModel.findOne(id)

        return res.status(400).json({
            data: item
        })
    } catch (error) {
        res.status({
            error: error.message
        })
    }
}

exports.getAllItem = async(res, req)=>{
    try {
        const item = await itemModel.find()
        return res.status(400).json({
            data: item
        })
    } catch (error) {
        res.status({
            error: error.message
        })
    }
}

exports.deleteItems = async(res, req)=>{
    try {
        const id = req.params.id
        const items = await itemModel.findByIdAndDelete(id)

        return res.status(400).json({
            message: "item has been deleted successfully",
            data: items
        })
    } catch (error) {
        res.status({
            error: error.message
        })
    }
}
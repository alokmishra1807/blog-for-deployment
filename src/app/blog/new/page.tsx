"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Cookies from "js-cookie";
import { RefreshCw } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";

import dynamic from "next/dynamic";
import { title } from "process";
import axios from "axios";

import { author_service, BlogCategory, useAppData} from "@/context/AppContext";
import { headers } from "next/headers";
import toast, { ToastBar } from "react-hot-toast";

const JoditEditor = dynamic(()=> import('jodit-react'),{ssr:false});

const {fetchBlog} = useAppData();

const AddBlog = () => {
    const editor = useRef(null);
	const [content, setContent] = useState('');

const [loading, setLoading] = useState(false)

const [formData,setFormData] = useState(
   { title:"",
    description:"",
    category:"",
    image:"",
    blogcontent:"",
}
);

const handleInputChange = (e:any) =>{
    setFormData({...formData,[e.target.name]:e.target.value}
    )
}

const handleFileChange = (e:any)=>{
    const file = e.target.files[0]
    setFormData({...formData,image:file})
}

const [aiTile, setAiTile] = useState(false);

const aiTitleResponse = async()=>{
    try {
        setAiTile(true);
        const {data} = await axios.post(`${author_service}/api/v1/ai/title`,{
            text: formData.title
        })

        setFormData({...formData,title:data})
    } catch (error) {
        toast.error("Problem while fetching from AI");
        console.log(error);
    }finally{
        setAiTile(false);
    }
}
const [aiDescription, setAiDescription] = useState(false);

const aiDescriptionResponse = async()=>{
    try {
        setAiDescription(true);
        const {data} = await axios.post(`${author_service}/api/v1/ai/description`,{
            title:formData.title,
            description: formData.description
        })

        setFormData({...formData,description:data})
    } catch (error) {
        toast.error("Problem while fetching from AI");
        console.log(error);
    }finally{
        setAiDescription(false);
    }
}

const [aiBlogLoading, setAiBlogLoading] = useState(false);

const aiBlogResponse = async()=>{
    try {
        setAiBlogLoading(true);
        const {data} = await axios.post(`${author_service}/api/v1/ai/blog`,{
           
            blog: formData.blogcontent
        });
        setContent(data.html);

        setFormData({...formData,blogcontent:data.html})
    } catch (error) {
        toast.error("Problem while fetching from AI");
       
        console.log(error);
    }finally{
        setAiBlogLoading(false);
    }
}



	const config = useMemo(() => ({
			readonly: false, // all options from https://xdsoft.net/jodit/docs/,
			placeholder:  'Start typings...'
		}),
		[]
	);
  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setLoading(true);

    const formDataTOSubmit = new FormData()

    formDataTOSubmit.append("title",formData.title)
    formDataTOSubmit.append("description",formData.description)
    formDataTOSubmit.append("blogcontent",formData.blogcontent)
    formDataTOSubmit.append("category",formData.category)
    

    if(formData.image){
        formDataTOSubmit.append("file",formData.image);
    }

    try {
        const token = Cookies.get("token")
        const {data} = await axios.post(`${author_service}/api/v1/blog/new`,formDataTOSubmit,{headers:{
Authorization:`Bearer ${token}`
        }})
        toast.success(data.message);
        setFormData( { title:"",
    description:"",
    category:"",
    image:"",
    blogcontent:"",
})
setContent("");
	     router.push("/blogs")
     setTimeout(()=>{
fetchBlog()
     },4000);;
    } catch (error) {
        toast.error("Error while adding blog")
    }finally{
        setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">Add New Blog</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Label>Title</Label>
            <div className="flex justify-center items-center gap-2">
              <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="Enter Blog Title"
              className={aiTile?"animate-pulse placeholder:opacity-60 ":""} required />
             {formData.title==="" ?"":<Button type="button" onClick={aiTitleResponse} disabled={aiTile}>
                <RefreshCw className={aiTile?"animate-spin" :""}/>
              </Button>}
            </div>
            <Label>Description</Label>
            <div className="flex justify-center items-center gap-2">
              <Input name="description" 
              value={formData.description} onChange={handleInputChange} placeholder="Write Blog Description"
               className={aiDescription?"animate-pulse placeholder:opacity-60 ":""} 
              required />
              <Button onClick={aiDescriptionResponse} type="button" disabled={aiDescription} className={aiDescription?"animate-pulse":""}>
                <RefreshCw />
              </Button>
            </div>
            <Label>Category</Label>
            <Select onValueChange={(value:any)=>setFormData({...formData,category:value || "select Category"})}>
              <SelectTrigger>
                <SelectValue placeholder={"Select Category"} />
              </SelectTrigger>
              <SelectContent>
                {BlogCategory?.map((e, i) => (
                  <SelectItem key={i} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div>
              <Label className="mb-2">Image Upload</Label>
              <Input  type="file" accept="image/*" onChange={handleFileChange} />
            </div>
            <div>
              <Label>Blog Content</Label>
              <div className="flex jstify-between items-center mb-2">
                <p className="text-sm text-muted-foreground">
Paste your blog or type here. You can use rich text formatting.
Please Add Image after improving your grammer!!
                </p>
                <Button type="button" size={"sm"} onClick={aiBlogResponse} disabled={aiBlogLoading} > <RefreshCw className={aiBlogLoading?"animate-spin":""} size={16} /><span className="ml-2">Fix Grammer</span></Button>
              </div>
              <JoditEditor ref={editor} value={content}
              config={config} tabIndex={1} onBlur={(newContent)=>{
                setContent(newContent);
                setFormData({...formData,blogcontent:newContent})
              }} />
            </div>
            <Button type="submit" disabled ={loading}className="w-full">{loading?"Submitting":"Submit"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBlog;

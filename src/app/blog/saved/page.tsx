"use client"
import BlogCard from '@/components/blogCard'
import Loading from '@/components/Loading'
import { useAppData } from '@/context/AppContext'
import React from 'react'

const savedBlogs = () => {

  const {blog,savedBlog  } = useAppData()

    if(!blog || !savedBlog){
      return <Loading/>
    }
const filteredBlogs = blog.filter((blog) =>
  savedBlog.some(saved => saved.blogid === blog.id.toString())
);
  return (
    <div className='container mx-auto px-4'>
      <h1 className='text-3xl font-bold mt-2'>Saved Blogs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((e, i) => {
            return (
              <BlogCard
                key={i}
                image={e.image}
                title={e.title}
                desc={e.description}
                id={e.id}
                time={e.created_at}
              />
            );
          })
        ) : (
          <p>No saved blogs yet!</p>
        )}
      </div>
    </div>
  )
}

export default savedBlogs
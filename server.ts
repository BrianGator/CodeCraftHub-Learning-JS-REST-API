/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Written by Brian McCarthy
 */

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs-extra";
import { createServer as createViteServer } from "vite";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'courses.json');
const PORT = 3000;

interface Course {
  id: number;
  name: string;
  description: string;
  target_date: string;
  status: 'Not Started' | 'In Progress' | 'Completed';
  created_at: string;
}

async function startServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Helper functions
  const loadCourses = async (): Promise<Course[]> => {
    try {
      if (!await fs.pathExists(DATA_FILE)) {
        await fs.writeJson(DATA_FILE, [], { spaces: 2 });
        return [];
      }
      return await fs.readJson(DATA_FILE);
    } catch (error) {
      console.error('Error loading courses:', error);
      return [];
    }
  };

  const saveCourses = async (courses: Course[]): Promise<boolean> => {
    try {
      await fs.writeJson(DATA_FILE, courses, { spaces: 2 });
      return true;
    } catch (error) {
      console.error('Error saving courses:', error);
      return false;
    }
  };

  const getNextId = (courses: Course[]): number => {
    if (courses.length === 0) return 1;
    return Math.max(...courses.map(c => c.id)) + 1;
  };

  // API Routes
  
  // GET all courses
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await loadCourses();
      res.status(200).json({
        success: true,
        count: courses.length,
        courses: courses
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to retrieve courses: ${error.message}`
      });
    }
  });

  // GET stats
  app.get('/api/courses/stats', async (req, res) => {
    try {
      const courses = await loadCourses();
      const stats = {
        total: courses.length,
        notStarted: courses.filter(c => c.status === 'Not Started').length,
        inProgress: courses.filter(c => c.status === 'In Progress').length,
        completed: courses.filter(c => c.status === 'Completed').length
      };
      res.status(200).json({
        success: true,
        stats
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to retrieve stats: ${error.message}`
      });
    }
  });

  // GET specific course
  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const courses = await loadCourses();
      const course = courses.find(c => c.id === courseId);
      
      if (course) {
        res.status(200).json({
          success: true,
          course: course
        });
      } else {
        res.status(404).json({
          success: false,
          error: `Course with ID ${courseId} not found`
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to retrieve course: ${error.message}`
      });
    }
  });

  // POST new course
  app.post('/api/courses', async (req, res) => {
    try {
      const data = req.body;
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data provided'
        });
      }
      
      const requiredFields = ['name', 'description', 'target_date', 'status'];
      const missingFields = requiredFields.filter(field => !data[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`
        });
      }
      
      const validStatuses = ['Not Started', 'In Progress', 'Completed'];
      if (!validStatuses.includes(data.status)) {
        return res.status(400).json({
          success: false,
          error: `Status must be one of: ${validStatuses.join(', ')}`
        });
      }
      
      const courses = await loadCourses();
      
      const newCourse: Course = {
        id: getNextId(courses),
        name: data.name,
        description: data.description,
        target_date: data.target_date,
        status: data.status,
        created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      courses.push(newCourse);
      
      if (await saveCourses(courses)) {
        res.status(201).json({
          success: true,
          message: 'Course added successfully',
          course: newCourse
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to save course'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to add course: ${error.message}`
      });
    }
  });

  // PUT update course
  app.put('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const data = req.body;
      
      if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No data provided'
        });
      }
      
      const courses = await loadCourses();
      const courseIndex = courses.findIndex(c => c.id === courseId);
      
      if (courseIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `Course with ID ${courseId} not found`
        });
      }
      
      if (data.status) {
        const validStatuses = ['Not Started', 'In Progress', 'Completed'];
        if (!validStatuses.includes(data.status)) {
          return res.status(400).json({
            success: false,
            error: `Status must be one of: ${validStatuses.join(', ')}`
          });
        }
      }
      
      const course = courses[courseIndex];
      if (data.name) course.name = data.name;
      if (data.description) course.description = data.description;
      if (data.target_date) course.target_date = data.target_date;
      if (data.status) course.status = data.status;
      
      courses[courseIndex] = course;
      
      if (await saveCourses(courses)) {
        res.status(200).json({
          success: true,
          message: 'Course updated successfully',
          course: course
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to save changes'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to update course: ${error.message}`
      });
    }
  });

  // DELETE course
  app.delete('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const courses = await loadCourses();
      const courseIndex = courses.findIndex(c => c.id === courseId);
      
      if (courseIndex === -1) {
        return res.status(404).json({
          success: false,
          error: `Course with ID ${courseId} not found`
        });
      }
      
      const deletedCourse = courses.splice(courseIndex, 1)[0];
      
      if (await saveCourses(courses)) {
        res.status(200).json({
          success: true,
          message: 'Course deleted successfully',
          deleted_course: deletedCourse
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to save changes'
        });
      }
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: `Failed to delete course: ${error.message}`
      });
    }
  });

  // Vite integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

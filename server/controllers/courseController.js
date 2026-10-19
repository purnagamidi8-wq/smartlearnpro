const { Course, Module, Lesson, Enrollment } = require('../models');
const asyncHandler = require('../utils/asyncHandler');
const { success, failure } = require('../utils/apiResponse');

// GET /api/courses  (public catalog - published only, unless admin)
const listCourses = asyncHandler(async (req, res) => {
  const filter = req.user && req.user.role === 'admin' ? {} : { status: 'published' };
  if (req.query.category) filter.category = req.query.category;

  const courses = await Course.find(filter).sort({ createdAt: -1 });
  return success(res, { data: { courses } });
});

// GET /api/courses/:id
const getCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id).populate({
    path: 'moduleOrder',
    populate: { path: 'lessonOrder', select: 'title order video.durationSeconds' },
  });
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  let enrollment = null;
  if (req.user && req.user.role === 'student') {
    enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });
  }

  return success(res, { data: { course, enrollment } });
});

// POST /api/courses (admin)
const createCourse = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return failure(res, { message: 'Title and description are required', statusCode: 400 });
  }
  const course = await Course.create({ ...req.body, createdBy: req.user._id });
  return success(res, { message: 'Course created successfully', statusCode: 201, data: { course } });
});

// PUT /api/courses/:id (admin)
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });
  return success(res, { message: 'Course updated successfully', data: { course } });
});

// DELETE /api/courses/:id (admin)
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  const moduleIds = course.moduleOrder;
  await Lesson.deleteMany({ course: course._id });
  await Module.deleteMany({ _id: { $in: moduleIds } });
  await course.deleteOne();

  return success(res, { message: 'Course deleted successfully' });
});

// POST /api/courses/:id/modules (admin)
const addModule = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  const mod = await Module.create({
    course: course._id,
    title: req.body.title,
    order: course.moduleOrder.length,
  });
  course.moduleOrder.push(mod._id);
  await course.save();

  return success(res, { message: 'Module added', statusCode: 201, data: { module: mod } });
});

// PUT /api/courses/:id/modules/reorder (admin) - body: { moduleIds: [...] }
const reorderModules = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return failure(res, { message: 'Course not found', statusCode: 404 });

  course.moduleOrder = req.body.moduleIds;
  await course.save();
  await Promise.all(
    req.body.moduleIds.map((id, idx) => Module.findByIdAndUpdate(id, { order: idx }))
  );

  return success(res, { message: 'Modules reordered' });
});

// POST /api/courses/modules/:moduleId/lessons (admin)
const addLesson = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.moduleId);
  if (!mod) return failure(res, { message: 'Module not found', statusCode: 404 });

  const lesson = await Lesson.create({
    ...req.body,
    module: mod._id,
    course: mod.course,
    order: mod.lessonOrder.length,
  });
  mod.lessonOrder.push(lesson._id);
  await mod.save();

  return success(res, { message: 'Lesson added', statusCode: 201, data: { lesson } });
});

// PUT /api/courses/modules/:moduleId/lessons/reorder (admin)
const reorderLessons = asyncHandler(async (req, res) => {
  const mod = await Module.findById(req.params.moduleId);
  if (!mod) return failure(res, { message: 'Module not found', statusCode: 404 });

  mod.lessonOrder = req.body.lessonIds;
  await mod.save();
  await Promise.all(
    req.body.lessonIds.map((id, idx) => Lesson.findByIdAndUpdate(id, { order: idx }))
  );

  return success(res, { message: 'Lessons reordered' });
});

// GET /api/courses/lessons/:lessonId
const getLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.lessonId).populate('quiz', 'title isFinalAssessment');
  if (!lesson) return failure(res, { message: 'Lesson not found', statusCode: 404 });

  if (req.user.role === 'student') {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lesson.course,
      status: 'approved',
    });
    if (!enrollment) {
      return failure(res, { message: 'You are not enrolled in this course', statusCode: 403 });
    }
  }

  return success(res, { data: { lesson } });
});

module.exports = {
  listCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  addModule,
  reorderModules,
  addLesson,
  reorderLessons,
  getLesson,
};

import { Link } from 'react-router-dom';
import { Clock, BarChart3 } from 'lucide-react';
import Badge from './Badge';

export default function CourseCard({ course, enrollmentStatus }) {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="group bg-white rounded-xl2 border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="h-32 bg-gradient-to-br from-indigo-600 to-cyan flex items-center justify-center">
        <span className="font-display text-white text-lg font-semibold px-4 text-center">{course.title}</span>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Badge tone="info">{course.category}</Badge>
          {enrollmentStatus && (
            <Badge tone={enrollmentStatus === 'approved' ? 'success' : enrollmentStatus === 'pending' ? 'warning' : 'danger'}>
              {enrollmentStatus}
            </Badge>
          )}
        </div>
        <h3 className="font-display font-semibold text-ink group-hover:text-indigo transition-colors">{course.title}</h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{course.description}</p>
        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><Clock size={14} /> {course.durationHours}h</span>
          <span className="flex items-center gap-1"><BarChart3 size={14} /> {course.difficulty}</span>
        </div>
      </div>
    </Link>
  );
}

import { Student, Faculty, ClassGroup, Submission } from '../types';

export const api = {
  // --- Students ---
  async getStudents(filters?: { classId?: string; department?: string }): Promise<Student[]> {
    const params = new URLSearchParams();
    if (filters?.classId) params.append('classId', filters.classId);
    if (filters?.department) params.append('department', filters.department);
    const res = await fetch(`/api/students?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getStudentById(id: string): Promise<Student> {
    const res = await fetch(`/api/students/${id}`);
    if (!res.ok) throw new Error('Failed to fetch student');
    return res.json();
  },

  async createStudent(studentData: Partial<Student>): Promise<Student> {
    const res = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create student');
    }
    return res.json();
  },

  async bulkImportStudents(students: Partial<Student>[]): Promise<{ count: number; importedCount?: number; students: Student[] }> {
    const res = await fetch('/api/students/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ students }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to bulk import students');
    }
    const data = await res.json();
    return {
      count: data.count,
      importedCount: data.count,
      students: data.students
    };
  },

  async updateStudent(id: string, studentData: Partial<Student>): Promise<Student> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(studentData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update student');
    }
    return res.json();
  },

  async deleteStudent(id: string): Promise<void> {
    const res = await fetch(`/api/students/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete student');
  },

  async syncStudent(id: string): Promise<{ success: boolean; student: Student }> {
    const res = await fetch(`/api/students/${id}/sync`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync student with LeetCode');
    }
    return res.json();
  },

  async syncStudentLeetcode(id: string): Promise<{ success: boolean; student: Student }> {
    return this.syncStudent(id);
  },

  async syncAllStudents(): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/sync-all', {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to sync students with LeetCode');
    }
    return res.json();
  },

  // --- Faculties ---
  async getFaculties(): Promise<Faculty[]> {
    const res = await fetch('/api/faculties');
    if (!res.ok) throw new Error('Failed to fetch faculties');
    return res.json();
  },

  async createFaculty(facultyData: Partial<Faculty>): Promise<Faculty> {
    const res = await fetch('/api/faculties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add faculty');
    }
    return res.json();
  },

  async updateFaculty(id: string, facultyData: Partial<Faculty>): Promise<Faculty> {
    const res = await fetch(`/api/faculties/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update faculty');
    }
    return res.json();
  },

  async deleteFaculty(id: string): Promise<void> {
    const res = await fetch(`/api/faculties/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete faculty');
  },

  // --- Classes ---
  async getClasses(): Promise<ClassGroup[]> {
    const res = await fetch('/api/classes');
    if (!res.ok) throw new Error('Failed to fetch classes');
    return res.json();
  },

  async createClass(classData: Partial<ClassGroup>): Promise<ClassGroup> {
    const res = await fetch('/api/classes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to create class');
    }
    return res.json();
  },

  async updateClass(id: string, classData: Partial<ClassGroup>): Promise<ClassGroup> {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(classData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update class');
    }
    return res.json();
  },

  async deleteClass(id: string): Promise<void> {
    const res = await fetch(`/api/classes/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete class');
  },

  async assignFacultyToClass(classId: string, facultyId: string): Promise<any> {
    const res = await fetch(`/api/classes/${classId}/assign-faculty`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facultyId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to assign faculty to class');
    }
    return res.json();
  },

  async updateClassMembers(classId: string, studentIds: string[]): Promise<any> {
    const res = await fetch(`/api/classes/${classId}/members`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentIds }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update class members');
    }
    return res.json();
  },

  async resetFacultyPassword(facultyId: string, newPassword: string): Promise<any> {
    const res = await fetch(`/api/faculties/${facultyId}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset faculty password');
    }
    return res.json();
  },

  // --- Submissions ---
  async getRecentSubmissions(limit = 40, classId?: string): Promise<Submission[]> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (classId && classId !== 'All') params.append('classId', classId);
    const res = await fetch(`/api/submissions/recent?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch recent submissions');
    return res.json();
  },

  async getSubmissions(limit = 40, classId?: string): Promise<Submission[]> {
    return this.getRecentSubmissions(limit, classId);
  },

  // --- Auth & Approvals ---
  async signupFaculty(facultyData: Partial<Faculty>): Promise<{ success: boolean; message: string; faculty: Faculty }> {
    const res = await fetch('/api/auth/faculty-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(facultyData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit faculty registration');
    }
    return res.json();
  },

  async forgotPasswordFaculty(data: { email: string; staffId: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/forgot-password/faculty', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset faculty password');
    }
    return res.json();
  },

  async forgotPasswordAdmin(data: { email: string; recoveryKey: string; newPassword: string }): Promise<{ success: boolean; message: string }> {
    const res = await fetch('/api/auth/forgot-password/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reset admin password');
    }
    return res.json();
  },

  async getPendingFaculties(): Promise<{ pendingCount: number; pending: Faculty[]; all: Faculty[] }> {
    const res = await fetch('/api/admin/pending-faculties');
    if (!res.ok) throw new Error('Failed to fetch pending faculties');
    return res.json();
  },

  async approveFaculty(id: string): Promise<{ success: boolean; message: string; faculty: Faculty }> {
    const res = await fetch(`/api/admin/approve-faculty/${id}`, {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve faculty');
    }
    return res.json();
  },

  async rejectFaculty(id: string, reason?: string): Promise<{ success: boolean; message: string; faculty: Faculty }> {
    const res = await fetch(`/api/admin/reject-faculty/${id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to reject faculty');
    }
    return res.json();
  },

  async approveAllFaculties(): Promise<{ success: boolean; message: string; count: number }> {
    const res = await fetch('/api/admin/approve-all-faculties', {
      method: 'POST',
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to approve all faculties');
    }
    return res.json();
  },

  // --- Bulk Deletions ---
  async deleteAllStudents(): Promise<{ message: string; count: number }> {
    const res = await fetch('/api/students', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete all students');
    return res.json();
  },

  async deleteAllClasses(): Promise<{ message: string; count: number }> {
    const res = await fetch('/api/classes', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete all classes');
    return res.json();
  },

  async deleteAllFaculties(): Promise<{ message: string; count: number }> {
    const res = await fetch('/api/faculties', { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete all faculties');
    return res.json();
  },

  async clearAllData(): Promise<{ message: string; students: number; classes: number; faculties: number }> {
    const res = await fetch('/api/clear-all', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to clear database');
    return res.json();
  },

  // --- Reset ---
  async resetDatabase(): Promise<void> {
    const res = await fetch('/api/reset', { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
  }
};

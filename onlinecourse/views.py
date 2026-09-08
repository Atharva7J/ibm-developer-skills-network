from django.shortcuts import render, get_object_or_404, redirect
from django.http import HttpResponseBadRequest
from .models import Course, Enrollment, Submission

def submit(request, course_id):
    user = request.user
    course = get_object_or_404(Course, pk=course_id)
    enrollment = Enrollment.objects.get(user=user, course=course)
    
    if request.method == 'POST':
        selected_choice_ids = []
        for key, value in request.POST.items():
            if key.startswith('choice_'):
                selected_choice_ids.append(int(value))
        
        submission = Submission.objects.create(enrollment=enrollment)
        submission.choices.set(selected_choice_ids)
        return redirect('onlinecourse:show_exam_result', course_id=course.id, submission_id=submission.id)
    return HttpResponseBadRequest()

def show_exam_result(request, course_id, submission_id):
    course = get_object_or_404(Course, pk=course_id)
    submission = get_object_or_404(Submission, pk=submission_id)
    selected_choice_ids = [choice.id for choice in submission.choices.all()]
    
    total_grade = 0
    earned_grade = 0
    questions = course.question_set.all()
    
    for question in questions:
        total_grade += question.grade
        if question.is_get_score(selected_choice_ids):
            earned_grade += question.grade
            
    grade_percentage = int((earned_grade / total_grade) * 100) if total_grade > 0 else 0
    passed = grade_percentage >= 80

    context = {
        'course': course,
        'selected_ids': selected_choice_ids,
        'grade': grade_percentage,
        'passed': passed
    }
    return render(request, 'onlinecourse/exam_result_bootstrap.html', context)

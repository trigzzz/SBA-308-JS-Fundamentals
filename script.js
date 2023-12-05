function getLearnerData(courseInfo, assignmentGroup, learnerSubmissions) {
    validateCourseAssignment(courseInfo, assignmentGroup);
    const assignmentDetails = getAssignmentDetails(assignmentGroup);
    const learnerData = processLearnerSubmissions(learnerSubmissions, assignmentDetails);
    const result = formatResult(learnerData);
    return result;
}

function validateCourseAssignment(courseInfo, assignmentGroup) {
    if (courseInfo.id !== assignmentGroup.course_id) {
        throw new Error("Invalid input: Assignment Group doesnt belong to its course.");
    }
}

function getAssignmentDetails(assignmentGroup) {
    const assignmentDetails = {};
    for (const assignment of assignmentGroup.assignments) {
        assignmentDetails[assignment.id] = {
            pointsPossible: assignment.points_possible,
            dueAt: new Date(assignment.due_at),
        };
    }
    return assignmentDetails;
}

function processLearnerSubmissions(learnerSubmissions, assignmentDetails) {
    const learnerData = {};

    for (const submission of learnerSubmissions) {
        const assignmentId = submission.assignment_id;
        const pointsPossible = assignmentDetails[assignmentId].pointsPossible;
        const dueAt = assignmentDetails[assignmentId].dueAt;

        if (new Date(submission.submission.submitted_at) <= dueAt) {
            const score = submission.submission.score;

            if (new Date(submission.submission.submitted_at) > dueAt) {
                const deduction = pointsPossible * 0.1;
                learnerData[submission.learner_id] = learnerData[submission.learner_id] || {};
                learnerData[submission.learner_id][assignmentId] = (score - deduction) / pointsPossible;
            } else {
                learnerData[submission.learner_id] = learnerData[submission.learner_id] || {};
                learnerData[submission.learner_id][assignmentId] = score / pointsPossible;
            }
        } else {
        continue;
        }
    }

    return learnerData;
}


function formatResult(learnerData) {
    const result = [];

    for (const learnerId in learnerData) {
        if (Object.hasOwnProperty.call(learnerData, learnerId)) {
            const assignments = learnerData[learnerId];
            const avg = calculateWeightedAverage(assignments);
            const formattedResult = {
                id: parseInt(learnerId),
                avg: avg,
                ...assignments,
            };
            result.push(formattedResult);
        }
    }

    return result;
}

function calculateWeightedAverage(assignments) {
    let totalScore = 0;
    let totalWeight = 0;

    for (const assignmentId in assignments) {
        if (Object.hasOwnProperty.call(assignments, assignmentId)) {
            const score = assignments[assignmentId];
            const weight = 1;
            totalScore += score * weight;
            totalWeight += weight;
        }
    }

    return totalWeight > 0 ? (totalScore / totalWeight) * 100 : 0;
}

//Example 
const courseInfo = { "id": 1, "name": "Course A" };
const assignmentGroup = {
    "id": 1,
    "name": "Group A",
    "course_id": 1,
    "group_weight": 0.5,
    "assignments": [
        { "id": 101, "name": "Assignment 1", "due_at": "2023-12-10", "points_possible": 100 },
    ],
};
const learnerSubmissions = [
    { "learner_id": 1, "assignment_id": 101, "submission": { "submitted_at": "2023-12-08", "score": 90 } },
];

try {
    const result = getLearnerData(courseInfo, assignmentGroup, learnerSubmissions);
    console.log(result);
} catch (error) {
    console.error(error.message);
}

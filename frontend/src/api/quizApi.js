import privateApi from "./axios";

export async function getQuizzes() {
  const { data } = await privateApi.get("quizzes/");
  return data;
}

export async function getQuizDetail(quizId) {
  const { data } = await privateApi.get(`quizzes/${quizId}/`);
  return data;
}

export async function getQuizForPlay(quizId) {
  const { data } = await privateApi.get(`quizzes/${quizId}/play/`);
  return data;
}

export async function getQuizzesByCategory(category) {
  const { data } = await privateApi.get(`quizzes/category/${category}/`);
  return data;
}

export async function getDailyQuiz() {
  const { data } = await privateApi.get("quizzes/daily/");
  return data;
}

export async function createQuiz(payload) {
  const { data } = await privateApi.post("quizzes/create/", payload);
  return data;
}

export async function updateQuiz(quizId, payload) {
  const { data } = await privateApi.put(`quizzes/${quizId}/edit/`, payload);
  return data;
}

export async function partialUpdateQuiz(quizId, payload) {
  const { data } = await privateApi.patch(`quizzes/${quizId}/edit/`, payload);
  return data;
}

export async function deleteQuiz(quizId) {
  await privateApi.delete(`quizzes/${quizId}/edit/`);
}

export async function submitQuiz(quizId, payload) {
  const { data } = await privateApi.post(`quizzes/${quizId}/submit/`, payload);
  return data;
}

export async function getQuizAttempts() {
  const { data } = await privateApi.get("attempts/");
  return data;
}

export async function getQuizAttemptDetail(attemptId) {
  const { data } = await privateApi.get(`attempts/${attemptId}/`);
  return data;
}

export async function getTutorQuizzes() {
  const { data } = await privateApi.get("tutor/quizzes/");
  return data;
}

<template>
  <div class="container mt-5 about-page">
    <h1 class="mb-4">About Grandma's Recipes</h1>
    <div class="mb-4">
      <p>
        <strong>Grandma's Recipes</strong> is a full-stack web application developed as part of the Internet Development Environments course. The project allows users to explore, search, and manage a personal collection of recipes, including family favorites and new culinary discoveries. Our goal is to provide a modern, user-friendly platform for food lovers to organize and share their cooking experiences.
      </p>
      <p>
        <strong>Development Team:</strong><br>
        Raz Ganon (208894444)<br>
        Keren Londner (209398619)
      </p>
    </div>
    <div class="mb-4">
      <h3>Previous Projects</h3>
      <ul>
        <li>
          <a href="https://wed-2023.github.io/208894444/" target="_blank">Assignment 1: Third Age Website (Bob Kane)</a>
        </li>
        <li>
          <a href="https://wed-2023.github.io/assignment2-209398619_208894444_assignment2/" target="_blank">Assignment 2: Spaceship Game (Space Invaders Style)</a>
        </li>
      </ul>
    </div>
    <div>
      <h3>Contact</h3>
      <p>For questions or feedback, please contact us via the course platform.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AboutPage'
}
</script>

<style scoped>
.about-page {
  max-width: 700px;
  margin: 0 auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem 2.5rem;
}
.about-page h1 {
  color: #1672fc;
  font-weight: bold;
}
.about-page a {
  color: #1672fc;
  text-decoration: underline;
}
.about-page a:hover {
  color: #0d47a1;
}
</style> 
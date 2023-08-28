import puppeteer from 'puppeteer';

export const fetchJobInfos = async (browser, jobs: string[]) => {
  const jobDetails = [];
  const linkUrl = 'https://www.linkedin.com/jobs/view/';

  try {
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();

    for (const id of jobs) {
      const obj = {};
      console.log(`Fetching info for job id: ${id}`);

      const jobUrl = `https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/${id}`;
      // For Bright Data proxy, set proxy options for page
      // await page.setExtraHTTPHeaders({
      //   'Proxy-Authorization': 'Basic ' + Buffer.from('username:password').toString('base64')
      // });
      const page = await browser.newPage();
      await page.goto(jobUrl);
      //   await page.goto(jobUrl);
      page.waitForNavigation();

      const titleElement = await page.$('.top-card-layout__title');
      if (titleElement) {
        const title = await page.evaluate(
          (element) => element.textContent.trim().toUpperCase(),
          titleElement,
        );
        obj['job_title'] = title;

        const companyElement = await page.$('.topcard__org-name-link');
        if (companyElement) {
          const company = await page.evaluate(
            (element) => element.textContent.trim().toUpperCase(),
            companyElement,
          );
          obj['company'] = company;

          const descriptionElement = await page.$('.show-more-less-html__markup');
          // const imageElement = await page.$('.artdeco-entity-image');
          const imageUrl = await page.evaluate(() => {
            const image = document.querySelector(
              'img.artdeco-entity-image.artdeco-entity-image--square-5',
            );
            return image ? image.getAttribute('data-delayed-url') : 'None';
          });
          if (descriptionElement) {
            const jobDescription = await page.evaluate(
              (element) => element.textContent.trim(),
              descriptionElement,
            );
            obj['image'] = imageUrl;
            obj[
              'description'
            ] = `JOB IMPORTED FROM LINKEDIN \n${company}\n${title}\n${jobDescription}`;
            obj['link_url'] = `${linkUrl}${id}`;

            obj['linkedin_job_description'] = jobDescription;
            jobDetails.push(obj);
          } else {
            console.log('Job description not found');
          }
        } else {
          console.log('Organization not found');
        }
      } else {
        console.log(`Title not found for Job Id: ${id}`);
      }
    }

    await browser.close();
  } catch (error) {
    console.error('Error:', error);
  }

  return jobDetails;
};

import * as puppeteer from 'puppeteer';

export const importJobs = async (companyCode: string, page: puppeteer.Page) => {
  const queryParams = `position=1&pageNum=0&f_C=${companyCode}&f_TPR=r604800&geoId=92000000`;
  const baseTargetUrl = `https://www.linkedin.com/jobs/search?${queryParams}`;
  // axiosRetry(axios, {
  //   retries: 3,
  //   retryDelay: axiosRetry.exponentialDelay,
  //   retryCondition: (error) => {
  //     return error?.response?.status === 409;
  //   },
  // });

  // const { data } = await axios.get(baseTargetUrl);
  // if (data) {
  //   const parser = new DOMParser();
  //   const doc = parser.parseFromString(data, 'text/html');
  //   const jobCountElement = doc.querySelector('.results-context-header__job-count');
  //   if (jobCountElement) {
  //     const jobCountText = jobCountElement.textContent.trim();
  //     console.log('Job Count Text:', jobCountText);
  //   }
  // }
  try {
    await page.goto(baseTargetUrl);
    page.waitForNavigation();

    // await page.waitForSelector('.results-context-header__job-count');

    // Extract the text content of the element with class results-context-header__job-count
    const totalJobs = await page.$eval('.results-context-header__job-count', (element) =>
      element.textContent.trim(),
    );
    if (totalJobs) {
      console.log('Total Jobs Count : ', totalJobs);
      // const jobIds = fetchJobIds(+totalJobs, queryParams, page);
      // return jobIds;
      return [];
    } else return [];
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

const fetchJobIds = async (totalJobs: number, queryParams: string, page: puppeteer.Page) => {
  const jobSearchUrl = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?${queryParams}`;
  const jobIds = new Set();
  try {
    for (let i = 0; i < Math.ceil(totalJobs / 25); i++) {
      const targetUrl = `${jobSearchUrl}&start=${i * 25}`;
      await page.goto(targetUrl);
      page.waitForNavigation();

      const allJobs = await page.$$('li');
      for (const jobElement of allJobs) {
        const baseCard = await jobElement.$('div.base-card');
        if (baseCard) {
          const jobid = await baseCard.evaluate((element) =>
            element.getAttribute('data-entity-urn'),
          );
          if (jobid) {
            const jobidParts = jobid.split(':');
            if (jobidParts.length === 4) {
              jobIds.add(jobidParts[3]);
            }
          }
        }
      }
    }
    return Array.from(jobIds);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
};

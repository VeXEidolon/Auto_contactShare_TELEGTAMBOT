require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const token = (process.env.TELEGRAM_API_KEY); 
const bot = new TelegramBot(token, { polling: true }); 

// Object to store user states
const userState = {};

// Start command with inline button
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const welcomeMessage = 'قبل از اینکه وارد کانال سیگنال رایگان بشی باید بدونی که سیگنال های تیم دنیای ارز سیگنال ها فیوچرز هست و نیاز به یه صرافی امن خارجی داریم صرافی lbank بهترین گزینه برای ما هست که نه احراز هویت می خواد نه وی پی ان پس دیگه هیچ مشکلی برای ترید کردن ندارید پس مطلب پایین رو بخونید تا بگم چیکار کنید👇❤️!';

    const options = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'شروع', callback_data: 'start' }]
            ]
        }
    };

    bot.sendMessage(chatId, welcomeMessage, options);
});

// Handle callback queries
bot.on('callback_query', (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'start') {
        // Set user state to 'awaiting_contact'
        userState[chatId] = 'awaiting_contact';

        // Send message with inline button
        bot.sendMessage(chatId, 'لطفاً شماره خود را با ما به اشتراک بگذارید.', {
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'اشتراک گذاری', callback_data: 'share_contact' }]
                ]
            }
        });
    } else if (query.data === 'share_contact') {
        // Ask for phone number with a custom keyboard
        bot.sendMessage(chatId, 'برای به اشتراک گذاشتن شماره خود، لطفاً از دکمه زیر استفاده کنید.', {
            reply_markup: {
                keyboard: [
                    [{ text: 'اشتراک گذاری', request_contact: true }]
                ],
                one_time_keyboard: true,
                resize_keyboard: true
            }
        });
    } else if (query.data === 'lets_go') {
        // Set user state to 'awaiting_code'
        userState[chatId] = 'awaiting_code';

        // Ask for the user code
        bot.sendMessage(chatId, 'لطفا ابتدا کد ثبت نامی lbank را بفرستید');
    }
});

// Handle contact (phone number)
bot.on('contact', (msg) => {
    const chatId = msg.chat.id;

    // Check if the user state is 'awaiting_contact'
    if (userState[chatId] === 'awaiting_contact') {
        // Send image and text message with inline button
        const imagePath = './IMG/TTT.jpg'; // Replace with the actual path to the image file
        const captionText = 'با لینکی که این پایین براتون میذارم اول تو صرافی lbank ثبت نام می کنید و بعد uid تون رو مثل عکس بالا کپی می کنید و برای ما همینجا تو ربات میفرستید بعد از اینکه فرستادید ربات uid رو چک میکنه و اگر با لینک ما ثبت نام کرده باشید لینک کانال سیگنال رایگان براتون ارسال میشه                www.lbank.com/en-US/login/?icode=DONYAIEARZ                         🔴در صورتی که با لینک ما ثبت نام نکنید و uid بفرستید از کانال سیگنال حذف خواهید شد🔴';

        bot.sendPhoto(chatId, imagePath, {
            caption: captionText,
            reply_markup: {
                inline_keyboard: [
                    [{ text: 'ثبت نام کردم', callback_data: 'lets_go' }]
                ]
            }
        });

        // Reset user state
        userState[chatId] = 'awaiting_code';
    }
});

// Handle user messages (waiting for code input)
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userCode = msg.text; // User input (text or numbers)

    // Check if the user state is 'awaiting_code'
    if (userState[chatId] === 'awaiting_code') {
        // Check if the message starts with "LB" and has exactly 10 characters (letters and numbers)
        const isValidCode = /^LB[\w\d]{8}$/.test(userCode);

        if (isValidCode) {
            // Send congrats message with a button to the channel
            bot.sendMessage(chatId, 'آفرین شما ثبت نام کردید 🥰', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'حالا میتونید عضو کانال سیگنال رایگان شید', url: 'https://t.me/+cnzlvyZPpVQzZDg0' }] // Replace with your channel link
                    ]
                }
            });

            // Clean up user state
            delete userState[chatId];
        } else {
            // If the code is invalid, send error message with inline button to restart
            bot.sendMessage(chatId, 'این کد ثبت نامی ما نیست', {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'شروع دوباره', callback_data: 'start' }]
                    ]
                }
            });
        }
    }
});



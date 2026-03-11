<!DOCTYPE HTML>
<html>

<head>
  <title>Contact Julia Heart</title>
  <meta name="description" content="Contact Julia Heart" />
  <meta name="keywords" content="Julia Heart, contact, art, enquiry" />
  <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
  <link rel="stylesheet" type="text/css" href="css/style.css" />
  <script type="text/javascript" src="js/modernizr-1.5.min.js"></script>
</head>

<body>
  <div id="main">
    <header>
      <div id="logo"><h1>JULIA<a href="#">HEART</a></h1></div>
      <nav>
        <ul class="lavaLampWithImage" id="lava_menu">
          <li><a href="index.html">home</a></li>
          <li><a href="about.html">about Julia</a></li>
          <li><a href="portfolio.html">gallery</a></li>
          <li class="current"><a href="contact.php">contact</a></li>
        </ul>
      </nav>
    </header>

    <div id="site_content">
      <div id="sidebar_container">
        <div id="gallery">
          <ul class="images">
            <li class="show"><img width="450" height="450" src="images/1.jpg" alt="Artwork by Julia Heart" /></li>
            <li><img width="450" height="450" src="images/2.jpg" alt="Artwork by Julia Heart" /></li>
            <li><img width="450" height="450" src="images/3.jpg" alt="Artwork by Julia Heart" /></li>
            <li><img width="450" height="450" src="images/4.jpg" alt="Artwork by Julia Heart" /></li>
            <li><img width="450" height="450" src="images/5.jpg" alt="Artwork by Julia Heart" /></li>
          </ul>
        </div>
      </div>

      <div id="content">
        <h1>Contact Julia Heart</h1>

        <?php
          ini_set('display_errors', 0);
          ini_set('display_startup_errors', 0);
          error_reporting(0);

          // Main recipient: Julia Heart
          $to = $_ENV['PRIMARY_EMAIL'] ?? '';

          // Optional second recipient: monitoring copy for you
          $client_email = $_ENV['MONITOR_EMAIL'] ?? '';

          $subject = 'Enquiry from the Julia Heart website';
          $contact_submitted = 'Your message has been sent.';

          // Load Composer + .env once
          if (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require __DIR__ . '/vendor/autoload.php';

            if (class_exists('Dotenv\\Dotenv') && file_exists(__DIR__ . '/.env')) {
              Dotenv\Dotenv::createImmutable(__DIR__)->safeLoad();
            }
          }

          // Reload env values after dotenv
          $to = $_ENV['PRIMARY_EMAIL'] ?? '';
          $client_email = $_ENV['MONITOR_EMAIL'] ?? '';

          // SMTP settings
          $use_smtp = filter_var($_ENV['USE_SMTP'] ?? 'false', FILTER_VALIDATE_BOOLEAN);
          $smtp_host = $_ENV['SMTP_HOST'] ?? '';
          $smtp_port = isset($_ENV['SMTP_PORT']) ? intval($_ENV['SMTP_PORT']) : 465;
          $smtp_username = $_ENV['SMTP_USERNAME'] ?? '';
          $smtp_password = $_ENV['SMTP_PASSWORD'] ?? '';
          $smtp_secure = $_ENV['SMTP_SECURE'] ?? 'ssl';
          $smtp_from = $_ENV['SMTP_FROM'] ?? 'no-reply@example.com';

          // Form values
          $yourname = '';
          $youremail = '';
          $yourmessage = '';

          function email_is_valid($email) {
            return (bool) filter_var($email, FILTER_VALIDATE_EMAIL);
          }

          if (!email_is_valid($to)) {
            echo '<p style="color: red;">You must set a valid primary recipient email address.</p>';
          }

          if ($client_email !== '' && !email_is_valid($client_email)) {
            echo '<p style="color: red;">The monitoring email address is not valid.</p>';
          }

          if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['contact_submitted'])) {
            $return = "\r\n";

            $youremail = trim($_POST['your_email'] ?? '');
            $yourname = trim($_POST['your_name'] ?? '');
            $yourmessage = trim($_POST['your_message'] ?? '');
            $user_answer = trim($_POST['user_answer'] ?? '');
            $answer = trim($_POST['answer'] ?? '');

            $contact_name = "Name: " . $yourname;
            $contact_email = "Email: " . $youremail;
            $message_text = "Message: " . $yourmessage;

            $message = $contact_name . $return . $contact_email . $return . $message_text;
            $message = wordwrap($message, 70);

            $is_valid_submission =
              email_is_valid($youremail) &&
              !preg_match('/[\r\n]/', $youremail) &&
              $yourname !== '' &&
              $yourmessage !== '' &&
              substr(md5($user_answer), 5, 10) === $answer;

            if ($is_valid_submission) {
              if ($use_smtp) {
                if (class_exists('PHPMailer\\PHPMailer\\PHPMailer')) {
                  try {
                    $mail = new PHPMailer\PHPMailer\PHPMailer(true);

                    $mail->Timeout = 15;
                    $mail->SMTPDebug = 0;

                    $mail->isSMTP();
                    $mail->Host = $smtp_host;
                    $mail->SMTPAuth = true;
                    $mail->Username = $smtp_username;
                    $mail->Password = $smtp_password;

                    if (!empty($smtp_secure)) {
                      $mail->SMTPSecure = $smtp_secure;
                    }

                    $mail->Port = $smtp_port;
                    $mail->isHTML(false);
                    $mail->CharSet = 'UTF-8';

                    $mail->setFrom($smtp_from, 'Julia Heart Website');
                    $mail->addAddress($to, 'Julia Heart');

                    if (!empty($client_email) && email_is_valid($client_email)) {
                      $mail->addAddress($client_email, 'Monitoring Copy');
                    }

                    $mail->addReplyTo($youremail, $yourname);
                    $mail->Subject = $subject;
                    $mail->Body = $message;

                    $mail->send();

                    $sent_from = $youremail;

                    $yourname = '';
                    $youremail = '';
                    $yourmessage = '';

                    echo '<p style="color: blue;">' . $contact_submitted . '</p>';

                    @file_put_contents(
                      __DIR__ . '/contact_sent.log',
                      date('[Y-m-d H:i:s]') . " Sent via SMTP to {$to}" .
                      (!empty($client_email) ? " and {$client_email}" : "") .
                      " | Reply-To: {$sent_from}" . PHP_EOL,
                      FILE_APPEND
                    );

                  } catch (Exception $e) {
                    $log = date('[Y-m-d H:i:s]') . " PHPMailer exception: " . $e->getMessage() . PHP_EOL;
                    @file_put_contents(__DIR__ . '/contact_failed.log', $log, FILE_APPEND);
                    echo '<p style="color: red;">Message could not be sent using SMTP.</p>';
                  }
                } else {
                  echo '<p style="color: orange;">PHPMailer not found on the server.</p>';
                }
              } else {
                $fixed_from = $smtp_from ?: 'no-reply@example.com';

                $recipients = $to;
                if (!empty($client_email) && email_is_valid($client_email)) {
                  $recipients .= ',' . $client_email;
                }

                $headers = 'From: Website <' . $fixed_from . '>' . "\r\n" .
                           'Reply-To: ' . $youremail . "\r\n" .
                           'X-Mailer: PHP/' . phpversion();

                $sent = mail($recipients, $subject, $message, $headers);

                if ($sent) {
                  $sent_from = $youremail;

                  $yourname = '';
                  $youremail = '';
                  $yourmessage = '';

                  echo '<p style="color: blue;">' . $contact_submitted . '</p>';

                  @file_put_contents(
                    __DIR__ . '/contact_sent.log',
                    date('[Y-m-d H:i:s]') . " Sent via mail() to {$recipients} | Reply-To: {$sent_from}" . PHP_EOL,
                    FILE_APPEND
                  );
                } else {
                  @file_put_contents(
                    __DIR__ . '/contact_failed.log',
                    date('[Y-m-d H:i:s]') . " mail() failed to {$recipients}" . PHP_EOL,
                    FILE_APPEND
                  );
                  echo '<p style="color: red;">Message could not be sent.</p>';
                }
              }

            } else {
              echo '<p style="color: red;">Please enter your name, a valid email address, your message and the answer to the simple maths question before sending your message.</p>';
            }
          }

          // Anti-spam maths question
          $number_1 = rand(1, 9);
          $number_2 = rand(1, 9);
          $answer = substr(md5($number_1 + $number_2), 5, 10);
        ?>

        <form id="contact" action="https://unitech.page.gd/contact.php" method="post">
          <div class="form_settings">
            <p>
              <span>Name</span>
              <input class="contact" type="text" name="your_name" value="<?php echo htmlspecialchars($yourname, ENT_QUOTES, 'UTF-8'); ?>" />
            </p>

            <p>
              <span>Email Address</span>
              <input class="contact" type="text" name="your_email" value="<?php echo htmlspecialchars($youremail, ENT_QUOTES, 'UTF-8'); ?>" />
            </p>

            <p>
              <span>Message</span>
              <textarea class="contact textarea" rows="5" cols="50" name="your_message"><?php echo htmlspecialchars($yourmessage, ENT_QUOTES, 'UTF-8'); ?></textarea>
            </p>

            <p style="padding: 10px 0; line-height: 2em;">
              To help prevent spam, please enter the answer to this question:
            </p>

            <p>
              <span><?php echo $number_1; ?> + <?php echo $number_2; ?> = ?</span>
              <input type="text" name="user_answer" />
              <input type="hidden" name="answer" value="<?php echo $answer; ?>" />
            </p>

            <p style="padding-top: 15px">
              <span>&nbsp;</span>
              <input class="submit" type="submit" name="contact_submitted" value="send" />
            </p>
          </div>
        </form>
      </div>
    </div>

    <footer>
      <p>www.juliaheart.co.uk</p>
    </footer>
  </div>

  <script type="text/javascript" src="js/jquery.min.js"></script>
  <script type="text/javascript" src="js/jquery.easing.min.js"></script>
  <script type="text/javascript" src="js/jquery.lavalamp.min.js"></script>
  <script type="text/javascript" src="js/image_fade.js"></script>
  <script type="text/javascript">
    $(function() {
      $("#lava_menu").lavaLamp({
        fx: "backout",
        speed: 700
      });
    });
  </script>
</body>
</html>